const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bulkMapping = require('./config/bulk-mapping');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.8080;

// Configuración de Email (Ejemplo con Gmail o SMTP genérico)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.use(cors());
app.use(express.json());

// --- Root Route for confirmation ---
app.all('/api/test-bancos/:id', (req, res) => res.send('OK ALL'));
app.get('/', (req, res) => {
    res.send('<h1>🚀 Servidor SGC funcionando correctamente</h1><p>Prueba los endpoints en /api/...</p>');
});

// --- Helper for Bulk Upload (Standard v1.0 - Architectural decision) ---
const runBulkImport = async (entityKey, items, dryRun = false) => {
    const config = bulkMapping[entityKey];
    if (!config) throw new Error(`Sin configuración para entidad: ${entityKey}`);

    let created = 0, updated = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
        const row = items[i];
        const rowNumber = i + 2; 
        try {
            const mappedData = {};
            // 0. Campos fijos
            if (config.fixedFields) {
                Object.assign(mappedData, config.fixedFields);
            }
            // 1. Mapeo
            for (const [excelKey, dbKey] of Object.entries(config.mapping)) {
                let value = row[excelKey];
                
                if (typeof value === 'string') {
                    const upper = value.toUpperCase().trim();
                    if (upper === 'SI' || upper === 'TRUE') value = true;
                    if (upper === 'NO' || upper === 'FALSE') value = false;
                }
                
                mappedData[dbKey] = value;
            }

            // 2. Resolución de relaciones (Política B: Rechazo)
            if (config.relations) {
                for (const [excelKey, relConfig] of Object.entries(config.relations)) {
                    const searchValue = row[excelKey];
                    if (!searchValue) continue;

                    const relatedRecord = await prisma[relConfig.model].findFirst({
                        where: { [relConfig.field]: { equals: String(searchValue).trim(), mode: 'insensitive' } }
                    });

                    if (!relatedRecord) {
                        throw new Error(`Relación no encontrada: ${relConfig.model} no cuenta con '${searchValue}' en campo '${relConfig.field}'`);
                    }
                    mappedData[relConfig.target] = relatedRecord.id;
                }
            }

            // 3. Normalización de uniqueKey para UPSERT (trim + toLowerCase)
            let whereClause = {};
            if (Array.isArray(config.uniqueKey)) {
                config.uniqueKey.forEach(key => {
                    let val = mappedData[key];
                    if (val === undefined) throw new Error(`Campo requerido faltante para clave única: ${key}`);
                    if (typeof val === 'string') val = val.trim().toLowerCase();
                    whereClause[key] = val;
                });
            } else {
                let uniqueVal = mappedData[config.uniqueKey];
                if (uniqueVal === undefined) throw new Error(`Campo requerido faltante para clave única: ${config.uniqueKey}`);
                
                if (config.uniqueKey === 'dni') {
                    uniqueVal = String(uniqueVal).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
                    mappedData[config.uniqueKey] = uniqueVal;
                } else if (typeof uniqueVal === 'string') {
                    uniqueVal = uniqueVal.trim().toLowerCase();
                }
                
                whereClause[config.uniqueKey] = uniqueVal;
            }

            // 4. PERSISTENCIA (Sólo si NO es dryRun)
            const exists = await prisma[config.model].findUnique({ where: whereClause });
            if (exists) {
                if (!dryRun) await prisma[config.model].update({ where: { id: exists.id }, data: mappedData });
                updated++;
            } else {
                if (!dryRun) await prisma[config.model].create({ data: mappedData });
                created++;
            }

        } catch (err) {
            errors.push({
                row: rowNumber,
                module: config.model,
                field: 'Multiple',
                value: JSON.stringify(row),
                error: err.message
            });
        }
    }

    // 5. Registro en Log de Auditoría (Solo si NO es dryRun)
    if (!dryRun) {
        await prisma.bulkUploadLog.create({
            data: {
                module: entityKey,
                processed: items.length,
                created,
                updated,
                status: errors.length === 0 ? 'success' : (errors.length < items.length ? 'warning' : 'error'),
                dryRun: false,
                errorsJson: JSON.stringify(errors)
            }
        });
    }

    return { 
        success: errors.length === 0, 
        processed: items.length, 
        created, 
        updated, 
        errors,
        dryRun
    };
};

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), database: 'SQLite' });
});

/**
 * @api {get} /api/residents Obtener Residentes
 * @apiDescription Retorna la lista de residentes activos (no archivados).
 */
app.get('/api/residents', async (req, res) => {
    const data = await prisma.resident.findMany({ where: { isArchived: false } });
    const parsedData = data.map(r => ({
        ...r,
        parkingIds: r.parkingIds ? JSON.parse(r.parkingIds) : [],
        conditionIds: r.conditionIds ? JSON.parse(r.conditionIds) : []
    }));
    res.json(parsedData);
});

app.post('/api/residents', async (req, res) => {
    try {
        const { parkingIds, conditionIds, ...rest } = req.body;
        const data = await prisma.resident.create({
            data: {
                ...rest,
                parkingIds: parkingIds ? JSON.stringify(parkingIds) : null,
                conditionIds: conditionIds ? JSON.stringify(conditionIds) : null
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/residents/upload', async (req, res) => {
    try {
        const result = await runBulkImport('residents', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Personal ---
app.get('/api/personnel', async (req, res) => {
    const data = await prisma.personnel.findMany({ where: { isArchived: false } });
    const parsedData = data.map(p => ({
        ...p,
        emergencyContact: p.emergencyContactJson ? JSON.parse(p.emergencyContactJson) : undefined,
        assignedArticles: p.assignedArticlesJson ? JSON.parse(p.assignedArticlesJson) : []
    }));
    res.json(parsedData);
});

app.post('/api/personnel', async (req, res) => {
    try {
        const { emergencyContact, assignedArticles, ...rest } = req.body;
        const data = await prisma.personnel.create({
            data: {
                ...rest,
                emergencyContactJson: emergencyContact ? JSON.stringify(emergencyContact) : null,
                assignedArticlesJson: assignedArticles ? JSON.stringify(assignedArticles) : null
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/personnel/:id', async (req, res) => {
    try {
        const { id, createdAt, emergencyContact, assignedArticles, ...updateData } = req.body;
        const data = await prisma.personnel.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                emergencyContactJson: emergencyContact ? JSON.stringify(emergencyContact) : (emergencyContact === null ? null : undefined),
                assignedArticlesJson: assignedArticles ? JSON.stringify(assignedArticles) : (assignedArticles === null ? null : undefined)
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/personnel/:id', async (req, res) => {
    try {
        await prisma.personnel.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/personnel/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    processCSV(req.file.path, async (results) => {
        try {
            for (const row of results) {
                await prisma.personnel.upsert({
                    where: { dni: row.dni || row.rut },
                    update: {
                        names: row.names || row.nombres,
                        lastNames: row.lastNames || row.apellidos,
                        address: row.address || row.direccion || 'Sin dirección',
                        baseSalary: parseFloat(row.baseSalary || row.sueldo_base) || 0,
                        position: row.position || row.cargo
                    },
                    create: {
                        names: row.names || row.nombres,
                        lastNames: row.lastNames || row.apellidos,
                        dni: row.dni || row.rut,
                        address: row.address || row.direccion || 'Sin dirección',
                        baseSalary: parseFloat(row.baseSalary || row.sueldo_base) || 0,
                        position: row.position || row.cargo
                    }
                });
            }
            fs.unlinkSync(req.file.path);
            res.json({ message: `Cargados ${results.length} registros de personal.` });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
});

/**
 * @api {get} /api/articles Obtener Inventario
 * @apiDescription Retorna la lista de artículos en bodega.
 */
app.get('/api/articulos_personal', async (req, res) => {
    const data = await prisma.article.findMany({ where: { isArchived: false } });
    res.json(data);
});

app.post('/api/articulos_personal', async (req, res) => {
    try {
        const data = await prisma.article.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/articulos_personal/upload', async (req, res) => {
    try {
        const result = await runBulkImport('articles', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/articulos_personal/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.article.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/articulos_personal/:id', async (req, res) => {
    try {
        await prisma.article.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Correspondencia ---
app.get('/api/correspondence', async (req, res) => {
    const data = await prisma.correspondence.findMany({ include: { department: true } });
    res.json(data);
});

app.post('/api/correspondence', async (req, res) => {
    try {
        const data = await prisma.correspondence.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Bancos, AFPs, Salud ---
app.get('/api/bancos', async (req, res) => {
    res.json(await prisma.bank.findMany({ where: { isArchived: false } }));
});

app.post('/api/bancos', async (req, res) => {
    try {
        const data = await prisma.bank.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/afps', async (req, res) => {
    res.json(await prisma.pensionFund.findMany({ where: { isArchived: false } }));
});

app.post('/api/afps', async (req, res) => {
    try {
        const data = await prisma.pensionFund.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/previsiones', async (req, res) => {
    res.json(await prisma.healthProvider.findMany({ where: { isArchived: false } }));
});

app.post('/api/previsiones', async (req, res) => {
    try {
        const data = await prisma.healthProvider.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

/**
 * @api {get} /api/towers Obtener Infraestructura
 * @apiDescription Retorna torres con sus respectivos departamentos.
 */
app.get('/api/towers', async (req, res) => {
    res.json(await prisma.tower.findMany({
        where: { isArchived: false },
        include: { departments: { where: { isArchived: false } } }
    }));
});

app.post('/api/towers', async (req, res) => {
    try {
        const { name, departments } = req.body;
        const data = await prisma.tower.create({
            data: {
                name,
                departments: {
                    create: departments?.map(d => ({
                        number: d.number,
                        unitTypeId: d.unitTypeId
                    }))
                }
            },
            include: { departments: true }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/towers/:id', async (req, res) => {
    try {
        await prisma.tower.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/towers/upload', async (req, res) => {
    try {
        const result = await runBulkImport('towers', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments/upload', async (req, res) => {
    try {
        const result = await runBulkImport('departments', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bancos/upload', async (req, res) => {
    try {
        const result = await runBulkImport('banks', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tipos_unidad/upload', async (req, res) => {
    try {
        const result = await runBulkImport('unit_types', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/afps/upload', async (req, res) => {
    try {
        const result = await runBulkImport('pension_funds', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/previsiones/upload', async (req, res) => {
    try {
        const result = await runBulkImport('health_providers', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/owners/upload', async (req, res) => {
    try {
        const result = await runBulkImport('owners', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/personnel/upload', async (req, res) => {
    try {
        const result = await runBulkImport('personnel', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/estacionamientos/upload', async (req, res) => {
    try {
        const result = await runBulkImport('parking', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_categorias_articulos/upload', async (req, res) => {
    try {
        const result = await runBulkImport('article_categories', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_emergencias/upload', async (req, res) => {
    try {
        const result = await runBulkImport('emergency_numbers', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/assets/upload', async (req, res) => {
    try {
        const result = await runBulkImport('assets', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @api {get} /api/common-expenses/payments Obtener Pagos de GGCC
 * @apiDescription Filtra pagos por año, mes o departamento.
 */
app.get('/api/common-expenses/payments', async (req, res) => {
    const { year, month, deptId } = req.query;
    const where = {};
    if (year) where.periodYear = parseInt(year);
    if (month) where.periodMonth = parseInt(month);
    if (deptId) where.departmentId = deptId;

    try {
        const data = await prisma.commonExpensePayment.findMany({
            where,
            include: { department: { include: { tower: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const parsedData = data.map(p => ({
            ...p,
            fundContributions: p.fundContributionsJson ? JSON.parse(p.fundContributionsJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/common-expenses/payments', async (req, res) => {
    try {
        const { departmentId, periodMonth, periodYear, amountPaid, paymentMethod, evidenceImage, notes, isElectronic, fundContributions } = req.body;

        // Generar folio si es electrónico
        let receiptFolio = req.body.receiptFolio;
        if (isElectronic && !receiptFolio) {
            receiptFolio = `GC-${periodYear}${String(periodMonth).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        }

        const data = await prisma.commonExpensePayment.create({
            data: {
                departmentId,
                periodMonth,
                periodYear,
                amountPaid: parseFloat(amountPaid),
                paymentMethod,
                evidenceImage,
                notes,
                isElectronic: !!isElectronic,
                receiptFolio,
                fundContributionsJson: JSON.stringify(fundContributions || []),
                status: 'paid'
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/common-expenses/rules', async (req, res) => {
    const data = await prisma.commonExpenseRule.findMany({
        where: { isArchived: false },
        include: { unitType: true },
        orderBy: { effectiveFrom: 'desc' }
    });
    res.json(data);
});

app.put('/api/towers/:id', async (req, res) => {
    try {
        const data = await prisma.tower.update({
            where: { id: req.params.id },
            data: req.body,
            include: { departments: true }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/common-expenses/rules', async (req, res) => {
    try {
        const data = await prisma.commonExpenseRule.create({
            data: {
                ...req.body,
                effectiveFrom: new Date(req.body.effectiveFrom),
                amount: parseFloat(req.body.amount)
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/common-expenses/calculate/:deptId', async (req, res) => {
    const { deptId } = req.params;
    try {
        const dept = await prisma.department.findUnique({
            where: { id: deptId },
            include: { unitType: true }
        });

        if (!dept) return res.status(404).json({ error: 'Department not found' });

        // Buscar la regla vigente hoy
        const rules = await prisma.commonExpenseRule.findMany({
            where: {
                OR: [
                    { unitTypeId: dept.unitTypeId },
                    { unitTypeId: null }
                ],
                isArchived: false,
                effectiveFrom: { lte: new Date() }
            },
            orderBy: { effectiveFrom: 'desc' },
            take: 1
        });

        const currentAmount = rules.length > 0 ? rules[0].amount : (dept.unitType?.baseCommonExpense || 0);

        res.json({
            departmentId: deptId,
            suggestedAmount: currentAmount,
            ruleUsed: rules[0] || 'base_price'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * @api {get} /api/common-expenses/funds Obtener Fondos Especiales
 * @apiDescription Retorna fondos. Soporta parámetro `includeArchived=true`.
 */
app.get('/api/common-expenses/funds', async (req, res) => {
    try {
        const { includeArchived } = req.query;
        const where = includeArchived === 'true' ? {} : { isArchived: false };
        const data = await prisma.specialFund.findMany({ where });
        // Parsear JSON strings a objetos
        const parsedData = data.map(f => ({
            ...f,
            unitConfigs: f.unitConfigsJson ? JSON.parse(f.unitConfigsJson) : [],
            expenses: f.expensesJson ? JSON.parse(f.expensesJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Alias for UI consistency
app.get('/api/special_funds', async (req, res) => {
    try {
        const data = await prisma.specialFund.findMany({ where: { isArchived: false } });
        const parsedData = data.map(f => ({
            ...f,
            unitConfigs: f.unitConfigsJson ? JSON.parse(f.unitConfigsJson) : [],
            expenses: f.expensesJson ? JSON.parse(f.expensesJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/special_funds', async (req, res) => {
    try {
        const { unitConfigs, expenses, ...rest } = req.body;
        const data = await prisma.specialFund.create({
            data: {
                ...rest,
                unitConfigsJson: JSON.stringify(unitConfigs || []),
                expensesJson: JSON.stringify(expenses || [])
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/common-expenses/funds', async (req, res) => {
    try {
        const { unitConfigs, expenses, ...rest } = req.body;
        const data = await prisma.specialFund.create({
            data: {
                ...rest,
                unitConfigsJson: JSON.stringify(unitConfigs || []),
                expensesJson: JSON.stringify(expenses || [])
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/common-expenses/funds/:id', async (req, res) => {
    try {
        const { unitConfigs, expenses, ...rest } = req.body;
        const data = await prisma.specialFund.update({
            where: { id: req.params.id },
            data: {
                ...rest,
                unitConfigsJson: JSON.stringify(unitConfigs || []),
                expensesJson: JSON.stringify(expenses || [])
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

/**
 * @api {delete} /api/common-expenses/funds/:id Eliminar (Archivar) Fondo Especial
 * @apiDescription Marca un fondo como archivado (soft delete).
 */
app.delete('/api/common-expenses/funds/:id', async (req, res) => {
    try {
        await prisma.specialFund.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

/**
 * @api {post} /api/common-expenses/funds/restore/:id Restaurar Fondo Especial
 * @apiDescription Restaura un fondo previamente archivado.
 */
app.post('/api/common-expenses/funds/restore/:id', async (req, res) => {
    try {
        await prisma.specialFund.update({
            where: { id: req.params.id },
            data: { isArchived: false }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/special_funds/:id', async (req, res) => {
    try {
        const { unitConfigs, expenses, ...rest } = req.body;
        const data = await prisma.specialFund.update({
            where: { id: req.params.id },
            data: {
                ...rest,
                unitConfigsJson: JSON.stringify(unitConfigs || []),
                expensesJson: JSON.stringify(expenses || [])
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/special_funds/:id', async (req, res) => {
    try {
        await prisma.specialFund.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Números de Emergencia ---
app.get('/api/maestro_emergencias', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_emergencias', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestro_emergencias/:id', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_emergencias/:id', async (req, res) => {
    try {
        await prisma.emergencyNumber.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Comunicaciones y Plantillas ---
app.get('/api/maestro_mensajes', async (req, res) => {
    try {
        const data = await prisma.communicationTemplate.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_mensajes', async (req, res) => {
    try {
        const data = await prisma.communicationTemplate.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_mensajes/:id', async (req, res) => {
    try {
        await prisma.communicationTemplate.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/communication_history', async (req, res) => {
    try {
        const data = await prisma.communicationHistory.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communication_history', async (req, res) => {
    try {
        const data = await prisma.communicationHistory.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/notify', async (req, res) => {


    const { to, subject, html } = req.body;
    try {
        await transporter.sendMail({
            from: `"SGC - Notificaciones" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Error al enviar el correo. Verifique la configuración SMTP.' });
    }
});

// --- Jornadas y Maestros Operativos ---
app.get('/api/jornada_groups', async (req, res) => {
    try {
        const data = await prisma.jornadaGroup.findMany({ where: { isArchived: false } });
        res.json(data.map(g => ({ 
            ...g, 
            workDays: JSON.parse(g.workDays || '[]'),
            schedules: JSON.parse(g.schedules || '[]')
        })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/jornada_groups', async (req, res) => {
    try {
        const { name, description, startTime, endTime, workDays, schedules, isActive, breakMinutes } = req.body;
        const data = await prisma.jornadaGroup.create({
            data: { 
                name,
                description,
                startTime: startTime || "00:00",
                endTime: endTime || "00:00",
                workDays: JSON.stringify(workDays || []),
                schedules: JSON.stringify(schedules || []),
                isActive: isActive !== undefined ? isActive : true,
                breakMinutes: breakMinutes || 0
            }
        });
        res.status(201).json({ 
            ...data, 
            workDays: JSON.parse(data.workDays),
            schedules: JSON.parse(data.schedules)
        });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/jornada_groups/:id', async (req, res) => {
    try {
        const { name, description, startTime, endTime, workDays, schedules, isActive, breakMinutes } = req.body;
        const data = await prisma.jornadaGroup.update({
            where: { id: req.params.id },
            data: { 
                name,
                description,
                startTime,
                endTime,
                workDays: JSON.stringify(workDays || []),
                schedules: JSON.stringify(schedules || []),
                isActive,
                breakMinutes
            }
        });
        res.json({ 
            ...data, 
            workDays: JSON.parse(data.workDays),
            schedules: JSON.parse(data.schedules)
        });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/jornada_groups/:id', async (req, res) => {
    try {
        await prisma.jornadaGroup.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// IPC Projections
app.get('/api/maestro_ipc', async (req, res) => {
    try {
        res.json(await prisma.iPCProjection.findMany());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_ipc', async (req, res) => {
    try {
        const { name, ipcRate, ponderadoRate, description, isActive } = req.body;
        const data = await prisma.iPCProjection.create({ 
            data: { name, ipcRate, ponderadoRate: ponderadoRate || 0, description, isActive } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestro_ipc/:id', async (req, res) => {
    try {
        const { name, ipcRate, ponderadoRate, description, isActive } = req.body;
        const data = await prisma.iPCProjection.update({ 
            where: { id: req.params.id }, 
            data: { name, ipcRate, ponderadoRate, description, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_ipc/:id', async (req, res) => {
    try {
        await prisma.iPCProjection.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Infrastructure Items
app.get('/api/infraestructura', async (req, res) => {
    try {
        res.json(await prisma.infrastructureItem.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/infraestructura', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.infrastructureItem.create({ 
            data: { name, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/infraestructura/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.infrastructureItem.update({ 
            where: { id: req.params.id }, 
            data: { name, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/infraestructura/:id', async (req, res) => {
    try {
        await prisma.infrastructureItem.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Equipment Items
app.get('/api/equipamiento', async (req, res) => {
    try {
        res.json(await prisma.equipmentItem.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipamiento', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.equipmentItem.create({ 
            data: { name, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/equipamiento/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.equipmentItem.update({ 
            where: { id: req.params.id }, 
            data: { name, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/equipamiento/:id', async (req, res) => {
    try {
        await prisma.equipmentItem.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// System Parameters (Maestros Varias)
app.get('/api/maestros_operativos', async (req, res) => {
    try {
        const data = await prisma.systemParameter.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestros_operativos', async (req, res) => {
    try {
        const data = await prisma.systemParameter.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestros_operativos/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.systemParameter.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestros_operativos/:id', async (req, res) => {
    try {
        await prisma.systemParameter.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// AFC
app.get('/api/afc', async (req, res) => {
    try {
        const data = await prisma.afc.findMany();
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/afc', async (req, res) => {
    try {
        const data = await prisma.afc.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/afc/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.afc.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/afc/:id', async (req, res) => {
    try {
        await prisma.afc.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Holidays
app.get('/api/feriados', async (req, res) => {
    try {
        const data = await prisma.holiday.findMany({ where: { isArchived: false }, orderBy: { date: 'asc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feriados', async (req, res) => {
    try {
        const data = await prisma.holiday.create({ 
            data: {
                ...req.body,
                date: new Date(req.body.date)
            } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/feriados/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        if (updateData.date) updateData.date = new Date(updateData.date);
        const data = await prisma.holiday.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/feriados/:id', async (req, res) => {
    try {
        await prisma.holiday.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// System Settings
app.get('/api/system_settings', async (req, res) => {
    try {
        const data = await prisma.systemSettings.findMany();
        const parsedData = data.map(s => ({
            ...s,
            emailTriggers: s.emailTriggers ? JSON.parse(s.emailTriggers) : {}
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/system_settings', async (req, res) => {
    try {
        const { emailTriggers, ...rest } = req.body;
        const data = await prisma.systemSettings.create({ 
            data: {
                ...rest,
                emailTriggers: emailTriggers ? JSON.stringify(emailTriggers) : null
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/system_settings/:id', async (req, res) => {
    try {
        const { id, createdAt, updatedAt, emailTriggers, ...updateData } = req.body;
        const data = await prisma.systemSettings.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                emailTriggers: emailTriggers ? JSON.stringify(emailTriggers) : (emailTriggers === null ? null : undefined)
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Health Providers (Previsiones / Salud) - PUT & DELETE missing ---
app.put('/api/previsiones/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.healthProvider.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/previsiones/:id', async (req, res) => {
    try {
        await prisma.healthProvider.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Banks - PUT & DELETE missing ---
app.put('/api/bancos/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.bank.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/bancos/:id', async (req, res) => {
    try {
        await prisma.bank.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Pension Funds (AFPs) - PUT & DELETE missing ---
app.put('/api/afps/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.pensionFund.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/afps/:id', async (req, res) => {
    try {
        await prisma.pensionFund.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Special Conditions (Condiciones Especiales) - full CRUD missing ---
app.get('/api/condiciones_especiales', async (req, res) => {
    try {
        const data = await prisma.specialCondition.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/condiciones_especiales', async (req, res) => {
    try {
        const data = await prisma.specialCondition.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/condiciones_especiales/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.specialCondition.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/condiciones_especiales/:id', async (req, res) => {
    try {
        await prisma.specialCondition.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Unit Types (Tipos de Unidad) - full CRUD missing ---
app.get('/api/tipos_unidad', async (req, res) => {
    try {
        const data = await prisma.unitType.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tipos_unidad', async (req, res) => {
    try {
        const { defaultM2, ...rest } = req.body;
        // defaultM2 is a frontend-only field – store it if the schema has it, otherwise ignore safely
        const data = await prisma.unitType.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/tipos_unidad/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, departments, commonExpenseRules, defaultM2, ...updateData } = req.body;
        const data = await prisma.unitType.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/tipos_unidad/:id', async (req, res) => {
    try {
        await prisma.unitType.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Common Spaces (Espacios Comunes) - full CRUD missing ---
app.get('/api/espacios', async (req, res) => {
    try {
        const data = await prisma.commonSpace.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/espacios', async (req, res) => {
    try {
        const data = await prisma.commonSpace.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/espacios/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, ...updateData } = req.body;
        const data = await prisma.commonSpace.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/espacios/:id', async (req, res) => {
    try {
        await prisma.commonSpace.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Parking (Estacionamientos) - full CRUD missing ---
app.get('/api/estacionamientos', async (req, res) => {
    try {
        const data = await prisma.parking.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/estacionamientos', async (req, res) => {
    try {
        const data = await prisma.parking.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/estacionamientos/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, department, ...updateData } = req.body;
        const data = await prisma.parking.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/estacionamientos/:id', async (req, res) => {
    try {
        await prisma.parking.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Residents - PUT & DELETE missing ---
app.put('/api/residents/:id', async (req, res) => {
    try {
        const { id, createdAt, departments, conditionIds, unitId, towerId, parkingIds, photo, ...updateData } = req.body;
        const data = await prisma.resident.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                parkingIds: parkingIds ? JSON.stringify(parkingIds) : (parkingIds === null ? null : undefined),
                conditionIds: conditionIds ? JSON.stringify(conditionIds) : (conditionIds === null ? null : undefined)
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/residents/:id', async (req, res) => {
    try {
        await prisma.resident.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Community Expenses (Egresos GC) - full CRUD missing ---
app.get('/api/community_expenses', async (req, res) => {
    try {
        const data = await prisma.communityExpense.findMany({
            where: { isArchived: false },
            orderBy: { date: 'desc' }
        });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/community_expenses', async (req, res) => {
    try {
        const data = await prisma.communityExpense.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/community_expenses/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, receiptImages, ...updateData } = req.body;
        const data = await prisma.communityExpense.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/community_expenses/:id', async (req, res) => {
    try {
        await prisma.communityExpense.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Departments - full CRUD missing ---
app.get('/api/departments', async (req, res) => {
    try {
        const data = await prisma.department.findMany({
            where: { isArchived: false },
            include: { tower: true, unitType: true }
        });
        const parsedData = data.map(d => ({
            ...d,
            history: d.historyJson ? JSON.parse(d.historyJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments', async (req, res) => {
    try {
        const { history, ...rest } = req.body;
        const data = await prisma.department.create({ 
            data: {
                ...rest,
                historyJson: history ? JSON.stringify(history) : null
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/departments/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, tower, unitType, resident, owner, commonExpensePayments, correspondence, parking, history, ...updateData } = req.body;
        const data = await prisma.department.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                historyJson: history ? JSON.stringify(history) : (history === null ? null : undefined)
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/departments/:id', async (req, res) => {
    try {
        await prisma.department.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Owners (Propietarios) - MISSING ---
app.get('/api/owners', async (req, res) => {
    try {
        const data = await prisma.owner.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/owners', async (req, res) => {
    try {
        const { id, createdAt, departments, ...rest } = req.body;
        const data = await prisma.owner.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/owners/:id', async (req, res) => {
    try {
        const { id, createdAt, departments, ...updateData } = req.body;
        const data = await prisma.owner.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/owners/:id', async (req, res) => {
    try {
        await prisma.owner.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Fixed Assets (Activo Fijo) - MISSING ---
app.get('/api/fixed_assets', async (req, res) => {
    try {
        const data = await prisma.fixedAsset.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fixed_assets', async (req, res) => {
    try {
        const { id, createdAt, maintenanceHistory, requiresMaintenance, nextMaintenanceDate, image, ...rest } = req.body;
        const data = await prisma.fixedAsset.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/fixed_assets/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, maintenanceHistory, requiresMaintenance, nextMaintenanceDate, image, ...updateData } = req.body;
        const data = await prisma.fixedAsset.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/fixed_assets/:id', async (req, res) => {
    try {
        await prisma.fixedAsset.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Soporte Especial: Cámaras (CCTV) ---
app.get('/api/cameras', async (req, res) => {
    try {
        const data = await prisma.camera.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cameras', async (req, res) => {
    try {
        const { id, createdAt, ...rest } = req.body;
        const data = await prisma.camera.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/cameras/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.camera.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/cameras/:id', async (req, res) => {
    try {
        await prisma.camera.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Article Deliveries (Vales de Entrega) ---
app.get('/api/article_deliveries', async (req, res) => {
    try {
        const data = await prisma.articleDelivery.findMany({
            include: { personnel: true },
            orderBy: { createdAt: 'desc' }
        });
        const parsedData = data.map(d => ({
            ...d,
            articles: d.articlesJson ? JSON.parse(d.articlesJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/article_deliveries', async (req, res) => {
    try {
        const { articles, ...rest } = req.body;
        const data = await prisma.articleDelivery.create({
            data: {
                ...rest,
                articlesJson: JSON.stringify(articles || [])
            }
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/article_deliveries/:id', async (req, res) => {
    try {
        const { id, createdAt, personnel, articles, ...updateData } = req.body;
        const data = await prisma.articleDelivery.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                articlesJson: articles ? JSON.stringify(articles) : undefined
            }
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/article_deliveries/:id', async (req, res) => {
    try {
        await prisma.articleDelivery.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Bulk Upload Logs (Historial de Auditoría) ---
app.get('/api/bulk_upload_logs', async (req, res) => {
    try {
        const data = await prisma.bulkUploadLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 for performance
        });
        const parsedData = data.map(log => ({
            ...log,
            errors: log.errorsJson ? JSON.parse(log.errorsJson) : []
        }));
        res.json(parsedData);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bulk_upload_logs/:id', async (req, res) => {
    try {
        await prisma.bulkUploadLog.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── FASE 1: Upload endpoints faltantes (estándar SGC) ──

app.post('/api/infraestructura/upload', async (req, res) => {
    try {
        const { items = [], dryRun = false } = req.body;
        const isDry = req.query.dryRun === 'true' || dryRun;
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.infrastructureItem.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.infrastructureItem.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.infrastructureItem.create({ data: { name: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipamiento/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.equipmentItem.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.equipmentItem.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.equipmentItem.create({ data: { name: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/espacios/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.commonSpace.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.commonSpace.update({ where: { id: exists.id }, data: { location: row.ubicacion || row.location || exists.location } }); updated++; }
            else { if (!isDry) await prisma.commonSpace.create({ data: { name: row.nombre || row.name, location: row.ubicacion || row.location || 'Sin ubicación', rentalValue: parseFloat(row.valor_arriendo || 0), durationHours: parseInt(row.duracion_horas || 1) } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/afc/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const existing = await prisma.afc.findFirst();
            const data = { fixedTermRate: parseFloat(row.tasa_contrato_fijo || row.fixedTermRate || 0), indefiniteTermRate: parseFloat(row.tasa_indefinido || row.indefiniteTermRate || 0) };
            if (existing) { if (!isDry) await prisma.afc.update({ where: { id: existing.id }, data }); updated++; }
            else { if (!isDry) await prisma.afc.create({ data }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feriados/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const dateStr = row.fecha || row.date;
            const description = row.descripcion || row.description || '';
            if (!dateStr) continue;
            const date = new Date(dateStr);
            const exists = await prisma.holiday.findFirst({ where: { date } });
            if (exists) { if (!isDry) await prisma.holiday.update({ where: { id: exists.id }, data: { description } }); updated++; }
            else { if (!isDry) await prisma.holiday.create({ data: { date, description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_ipc/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.iPCProjection.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.iPCProjection.update({ where: { id: exists.id }, data: { ipcRate: parseFloat(row.tasa_ipc || row.ipcRate || exists.ipcRate) } }); updated++; }
            else { if (!isDry) await prisma.iPCProjection.create({ data: { name: row.nombre || row.name, ipcRate: parseFloat(row.tasa_ipc || row.ipcRate || 0), ponderadoRate: parseFloat(row.tasa_ponderado || 0) } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestros_operativos/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            const type = String(row.tipo || row.type || 'general');
            if (!name) continue;
            const exists = await prisma.systemParameter.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, type } });
            if (exists) { if (!isDry) await prisma.systemParameter.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.systemParameter.create({ data: { name: row.nombre || row.name, type, description: row.descripcion || row.description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_mensajes/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.communicationTemplate.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.communicationTemplate.update({ where: { id: exists.id }, data: { subject: row.asunto || row.subject || exists.subject, message: row.mensaje || row.message || exists.message } }); updated++; }
            else { if (!isDry) await prisma.communicationTemplate.create({ data: { name: row.nombre || row.name, subject: row.asunto || row.subject || '', message: row.mensaje || row.message || '' } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/condiciones_especiales/upload', async (req, res) => {
    try {
        const { items = [] } = req.body;
        const isDry = req.query.dryRun === 'true';
        let created = 0, updated = 0;
        for (const row of items) {
            const name = String(row.nombre || row.name || '').trim().toLowerCase();
            if (!name) continue;
            const exists = await prisma.specialCondition.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.specialCondition.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.specialCondition.create({ data: { name: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => {
    console.log(`🚀 SGC Full Backend en http://localhost:${PORT}`);
});

module.exports = app;
