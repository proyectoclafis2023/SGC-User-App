const XLSX = require('xlsx');
const registry = require('./mapping/registry');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

/**
 * Discovery: Filter masters from registry
 */
function getMasters() {
    return Object.keys(registry).filter(key => registry[key].isMaster);
}

/**
 * EXPORT
 */
async function exportEntities(entityKeys = null) {
    const keys = entityKeys || getMasters();
    const wb = XLSX.utils.book_new();

    for (const key of keys) {
        const config = registry[key];
        if (!config) continue;

        const prismaClient = config.model.charAt(0).toLowerCase() + config.model.slice(1);
        
        // Dynamic filter detection
        let filter = {};
        if (config.fields.some(f => f.bd === 'isArchived')) filter = { isArchived: false };
        else if (config.fields.some(f => f.bd === 'isActive')) filter = { isActive: true };

        const data = await prisma[prismaClient].findMany({ where: filter });
        
        const headers = config.fields.filter(f => f.excel).map(f => f.excel);
        const excelRows = data.map(record => {
            const row = {};
            config.fields.forEach(field => {
                if (field.excel) {
                    row[field.excel] = record[field.bd] ?? '';
                }
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(excelRows, { header: headers });
        XLSX.utils.book_append_sheet(wb, ws, key);
    }

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * INTEGRITY CHECK: Can we archive this record?
 */
async function checkIntegrity(modelName, id) {
    // Dynamically check if any other model points to this ID
    // Since we don't have a global schema cross-reference easily, 
    // we'll check based on the 'relations' defined in registry.
    
    const dependencies = [];
    for (const [key, config] of Object.entries(registry)) {
        if (!config.relations) continue;
        
        for (const [relField, relTarget] of Object.entries(config.relations)) {
            // relTarget is the entity key (e.g. 'unidades')
            // if relTarget matches the current entity key we are archiving
            // we must find the entity key for modelName
            const targetConfig = Object.entries(registry).find(([k, v]) => v.model === modelName);
            if (!targetConfig) continue;

            if (relTarget === targetConfig[0]) {
                // This model (config.model) has a field pointing to our target
                // We need to find the prisma field name for relField
                // This is a bit complex. For now, we'll try to find the count.
                // Standard: relField + 'Id' exists in camelCase for Prisma
                const prismaClient = config.model.charAt(0).toLowerCase() + config.model.slice(1);
                const fieldName = relField + 'Id';
                
                let filter = { [fieldName]: id };
                if (config.fields.some(f => f.bd === 'isArchived')) filter.isArchived = false;
                else if (config.fields.some(f => f.bd === 'isActive')) filter.isActive = true;

                try {
                    const count = await prisma[prismaClient].count({ where: filter });
                    if (count > 0) dependencies.push(`${config.model} (${count} registros)`);
                } catch (e) { /* ignore field mismatches */ }
            }
        }
    }
    return dependencies;
}

/**
 * IMPORT / SYNC (Full Replace Controlled)
 */
async function importEntities(buffer, dryRun = true, user = 'System') {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const results = {};
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../logs/backups');
    
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    // 1. BACKUP (Auto-export)
    const backupBuffer = await exportEntities();
    fs.writeFileSync(path.join(backupDir, `backup_${timestamp}.xlsx`), backupBuffer);

    // 2. Order entities to resolve dependencies
    // (1. Towers/UnitTypes, 2. Departments, 3. Operations)
    // We'll use the SheetNames as provided but try to be smart
    const sheetNames = wb.SheetNames.filter(name => registry[name]?.isMaster);
    
    // Simple sort: entities with NO relations first
    sheetNames.sort((a, b) => {
        const ra = Object.keys(registry[a].relations || {}).length;
        const rb = Object.keys(registry[b].relations || {}).length;
        return ra - rb;
    });

    for (const sheetName of sheetNames) {
        const config = registry[sheetName];
        const prismaClient = config.model.charAt(0).toLowerCase() + config.model.slice(1);
        const excelRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

        let filter = {};
        if (config.fields.some(f => f.bd === 'isArchived')) filter = { isArchived: false };
        else if (config.fields.some(f => f.bd === 'isActive')) filter = { isActive: true };

        const dbRecords = await prisma[prismaClient].findMany({ where: filter });
        
        const summary = {
            entity: sheetName,
            to_create: [],
            to_update: [],
            to_archive: [],
            errors: []
        };

        const excelIds = excelRows.map(r => r.id).filter(id => !!id);
        const dbIds = dbRecords.map(r => r.id);

        // A. CLASSIFY: ARCHIVE
        for (const record of dbRecords) {
            if (!excelIds.includes(record.id)) {
                const deps = await checkIntegrity(config.model, record.id);
                if (deps.length > 0) {
                    summary.errors.push(`Bloqueo de Archivo: ${sheetName} ID ${record.id} tiene dependencias en: ${deps.join(', ')}`);
                } else {
                    summary.to_archive.push(record.id);
                }
            }
        }

        // B. CLASSIFY: CREATE/UPDATE
        for (const row of excelRows) {
            const mappedData = {};
            config.fields.forEach(f => {
                if (f.excel && row[f.excel] !== undefined) {
                    mappedData[f.bd] = row[f.excel];
                }
            });

            if (row.id && dbIds.includes(row.id)) {
                summary.to_update.push({ id: row.id, data: mappedData });
            } else {
                summary.to_create.push(mappedData);
            }
        }

        results[sheetName] = {
            summary: {
                created: summary.to_create.length,
                updated: summary.to_update.length,
                archived: summary.to_archive.length
            },
            errors: summary.errors
        };

        // 3. PERSIST (If not dryRun)
        if (!dryRun && summary.errors.length === 0) {
            // Perform in transaction or sequential
            try {
                const prismaClient = config.model.charAt(0).toLowerCase() + config.model.slice(1);
                // Archive
                if (summary.to_archive.length > 0) {
                    const deleteField = config.fields.some(f => f.bd === 'isActive') ? 'isActive' : 'isArchived';
                    const deleteValue = deleteField === 'isActive' ? false : true;

                    await prisma[prismaClient].updateMany({
                        where: { id: { in: summary.to_archive } },
                        data: { [deleteField]: deleteValue }
                    });
                }
                // Create
                for (const data of summary.to_create) {
                    delete data.id;
                    await prisma[prismaClient].create({ data });
                }
                // Update
                for (const update of summary.to_update) {
                    const { id, data } = update;
                    delete data.id;
                    await prisma[prismaClient].update({ where: { id }, data });
                }
            } catch (err) {
                results[sheetName].errors.push(`Runtime error: ${err.message}`);
            }
        }
    }

    // 4. Audit
    if (!dryRun) {
        await prisma.bulkUploadLog.create({
            data: {
                module: 'DYNAMIC_ENGINE_810',
                processed: sheetNames.length,
                created: Object.values(results).reduce((a, b) => a + (b.summary?.created || 0), 0),
                updated: Object.values(results).reduce((a, b) => a + (b.summary?.updated || 0), 0),
                archived: Object.values(results).reduce((a, b) => a + (b.summary?.archived || 0), 0),
                status: Object.values(results).some(r => r.errors.length > 0) ? 'error' : 'success',
                dryRun: false,
                errorsJson: JSON.stringify(results)
            }
        });
    }

    return { results, dryRun, backup: `backup_${timestamp}.xlsx` };
}

module.exports = { getMasters, exportEntities, importEntities };
