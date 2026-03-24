const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { requestMapper } = require('./core/mapping/middleware');
const { mapResponse } = require('./core/mapping/response');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const bulkMapping = require('./config/bulk-mapping');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3001;

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

// --- PRODUCTION SECURITY (Phase 1, 3, 4) ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: 'Límite de peticiones excedido, intente en 15 minutos' }
});
app.use('/api/', apiLimiter);

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Autenticación requerida' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sgc_prod_secret');
        const user = await prisma.personnel.findUnique({
            where: { id: decoded.userId },
            include: { roleRef: { include: { permissions: { include: { permission: true } } } } }
        });

        if (!user || user.isArchived) return res.status(401).json({ error: 'Acceso denegado' });

        req.user = user;
        req.isAdmin = (user.roleRef?.name === 'Administrador');
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
};

// Audit Helper (Phase 2)
const audit = async (req, action, entity, details = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action,
                entity,
                endpoint: req.originalUrl,
                method: req.method,
                status: req.res?.statusCode || 200,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (e) { console.error('[AUDIT]', e); }
};

// --- Login Endpoint (Phase 1) ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body; 
    console.log(`[LOGIN] Attempt: ${username}`);
    try {
        const user = await prisma.personnel.findFirst({
            where: { email: username, isArchived: false }
        });
        console.log(`[LOGIN] Found user:`, user ? user.id : 'NONE');

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET || 'sgc_prod_secret', 
            { expiresIn: '8h' }
        );

        req.user = user; // Temporary attach for audit log
        await audit(req, 'LOGIN_SUCCESS', 'System', { email: username });

        res.json({
            token,
            user: { id: user.id, names: user.names, role: user.role }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RBAC Middleware (Production v3.0) ---
const authorize = (permissions) => {
    return async (req, res, next) => {
        // Authenticate first
        await authenticate(req, res, async () => {
            if (req.isAdmin) return next();
            if (!permissions) return next();

            const perms = Array.isArray(permissions) ? permissions : [permissions];
            const userPerms = req.user.roleRef?.permissions.map(rp => rp.permission.slug) || [];
            const hasPermission = perms.every(p => userPerms.includes(p));

            if (!hasPermission) {
                console.warn(`[SECURITY] Forbidden: User ${req.user.id} lacks ${permissions}`);
                await audit(req, 'UNAUTHORIZED_ACCESS', 'System', { requestedPerms: permissions });
                return res.status(403).json({ error: 'Acceso restringido: Permisos insuficientes' });
            }
            next();
        });
    };
};

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
    try {
        const data = await prisma.residente.findMany({ 
            where: { isArchived: false },
            include: {
                departments: {
                    include: {
                        tower: true
                    }
                }
            }
        });
        res.json(mapResponse('resident', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/residents', requestMapper('resident'), async (req, res) => {
    try {
        const data = await prisma.residente.create({ data: req.body });
        res.status(201).json(mapResponse('resident', data));
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
    try {
        const data = await prisma.personnel.findMany({ 
            where: { isArchived: false },
            include: { bank: true, pensionFund: true, healthProvider: true, articleDeliveries: true }
        });
        res.json(mapResponse('personnel', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/personnel', requestMapper('personnel'), async (req, res) => {
    try {
        const data = await prisma.personnel.create({ data: req.body });
        res.status(201).json(mapResponse('personnel', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/personnel/:id', requestMapper('personnel'), async (req, res) => {
    try {
        const data = await prisma.personnel.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('personnel', data));
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
    try {
        const data = await prisma.articulo.findMany({ where: { isArchived: false } });
        res.json(mapResponse('article', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/articulos_personal', requestMapper('article'), async (req, res) => {
    try {
        const data = await prisma.articulo.create({ data: req.body });
        res.status(201).json(mapResponse('article', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/articulos_personal/upload', async (req, res) => {
    try {
        const result = await runBulkImport('articles', req.body.items || [], req.query.dryRun === 'true');
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/articulos_personal/:id', requestMapper('article'), async (req, res) => {
    try {
        const data = await prisma.articulo.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('article', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/articulos_personal/:id', async (req, res) => {
    try {
        await prisma.articulo.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Correspondencia ---
app.get('/api/correspondence', async (req, res) => {
    try {
        const data = await prisma.correspondence.findMany({ 
            where: { isArchived: false },
            include: { department: true } 
        });
        res.json(mapResponse('package', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/correspondence', requestMapper('package'), async (req, res) => {
    try {
        const data = await prisma.correspondence.create({ data: req.body });
        res.status(201).json(mapResponse('package', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/correspondence/:id', requestMapper('package'), async (req, res) => {
    try {
        const data = await prisma.correspondence.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('package', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/correspondence/:id', async (req, res) => {
    try {
        await prisma.correspondence.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Bancos, AFPs, Salud ---
app.get('/api/bancos', async (req, res) => {
    const data = await prisma.banco.findMany({ where: { isArchived: false } });
    res.json(mapResponse('bank', data));
});

app.post('/api/bancos', requestMapper('bank'), async (req, res) => {
    try {
        const data = await prisma.banco.create({ data: req.body });
        res.status(201).json(mapResponse('bank', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/afps', async (req, res) => {
    const data = await prisma.pensionFund.findMany({ where: { isArchived: false } });
    res.json(mapResponse('pension_fund', data));
});

app.post('/api/afps', requestMapper('pension_fund'), async (req, res) => {
    try {
        const data = await prisma.pensionFund.create({ data: req.body });
        res.status(201).json(mapResponse('pension_fund', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/previsiones', async (req, res) => {
    const data = await prisma.healthProvider.findMany({ where: { isArchived: false } });
    res.json(mapResponse('health_provider', data));
});

app.post('/api/previsiones', requestMapper('health_provider'), async (req, res) => {
    try {
        const data = await prisma.healthProvider.create({ data: req.body });
        res.status(201).json(mapResponse('health_provider', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

/**
 * @api {get} /api/towers Obtener Infraestructura
 * @apiDescription Retorna torres con sus respectivos departamentos.
 */
app.get('/api/towers', async (req, res) => {
    try {
        const data = await prisma.tower.findMany({
            where: { isArchived: false },
            include: { departments: { where: { isArchived: false } } }
        });
        res.json(mapResponse('tower', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/towers', requestMapper('tower'), async (req, res) => {
    try {
        const { name, departments } = req.body;
        const data = await prisma.tower.create({
            data: {
                name,
                departments: {
                    create: departments?.map(d => ({
                        number: d.number,
                        unitTypeId: d.unit_type_id
                    }))
                }
            },
            include: { departments: true }
        });
        res.status(201).json(mapResponse('tower', data));
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
 * @apiDescription Filtra pagos por año, mes o // --- Gastos Comunes (Debts) ---
 */
app.get('/api/common_expense_payments', authorize('common_expenses:view'), async (req, res) => {
    let { year, month, dept_id } = req.query;
    const where = { isArchived: false };

    // Phase 2: Ownership filter for Residents
    if (!req.isAdmin) {
        // Find units where this user is resident
        const myUnits = await prisma.department.findMany({
            where: { OR: [{ residentId: req.user.id }, { ownerId: req.user.id }] },
            select: { id: true }
        });
        const myUnitIds = myUnits.map(u => u.id);
        where.departmentId = { in: myUnitIds };
    } else {
        if (year) where.periodYear = parseInt(year);
        if (month) where.periodMonth = parseInt(month);
        if (dept_id) where.departmentId = dept_id;
    }

    try {
        const data = await prisma.commonExpensePayment.findMany({
            where,
            include: { department: { include: { tower: true } } },
            orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
        });
        res.json(mapResponse('common_expense_payment', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/common_expense_payments', requestMapper('common_expense_payment'), async (req, res) => {
    try {
        const data = await prisma.commonExpensePayment.create({ data: req.body });
        res.status(201).json(mapResponse('common_expense_payment', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Master Generation Logic
app.get('/api/common_expenses', async (req, res) => {
    try {
        const data = await prisma.commonExpense.findMany({
            where: { isArchived: false },
            include: { payments: true },
            orderBy: { period: 'desc' }
        });
        res.json(mapResponse('common_expense', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/common_expenses', requestMapper('common_expense'), async (req, res) => {
    const { period, totalAmount } = req.body;
    try {
        // 1. Check if period already exists
        const existing = await prisma.commonExpense.findUnique({ where: { period } });
        if (existing) return res.status(400).json({ error: 'El periodo ya ha sido procesado y bloqueado.' });

        // 2. Get all active departments and types
        const [departments, chargeRules] = await Promise.all([
            prisma.department.findMany({ where: { isArchived: false }, include: { unitType: true } }),
            prisma.chargeRule.findMany({ where: { isActive: true, isArchived: false } })
        ]);

        const totalM2 = departments.reduce((acc, d) => acc + (d.m2 || 0), 0);
        if (totalM2 === 0) throw new Error('No se pueden calcular por m2: total m2 es 0');

        // 3. Create Master Record
        const master = await prisma.commonExpense.create({
            data: {
                period,
                totalAmount: totalAmount,
                calculatedAt: new Date()
            }
        });

        // 4. Create Payments (Debt) for each department
        const [year, month] = period.split('-').map(Number);
        const paymentsData = departments.map(d => {
            let amount = Math.round((totalAmount / totalM2) * (d.m2 || 0));
            
            // Apply Charge Rules
            chargeRules.forEach(rule => {
                let applies = false;
                if (rule.appliesTo === 'global') applies = true;
                else if (rule.appliesTo === 'unit_type' && rule.targetId === d.unitTypeId) applies = true;
                else if (rule.appliesTo === 'department' && rule.targetId === d.id) applies = true;
                
                if (applies) {
                    if (rule.ruleType === 'fixed' || rule.ruleType === 'penalty' || rule.ruleType === 'interest') {
                        amount += rule.value;
                    } else if (rule.ruleType === 'percentage') {
                        amount += Math.round(amount * (rule.value / 100));
                    }
                }
            });

            return {
                departmentId: d.id,
                commonExpenseId: master.id,
                periodMonth: month,
                periodYear: year,
                amountPaid: amount,
                status: 'unpaid',
                notes: `Generado automáticamente por periodo ${period}${chargeRules.length > 0 ? ' (Reglas aplicadas)' : ''}`,
                isElectronic: true
            };
        });

        const result = await prisma.commonExpensePayment.createMany({ data: paymentsData });

        res.status(201).json({
            ...mapResponse('common_expense', master),
            generation_result: result
        });
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
        const data = await prisma.numeroEmergencia.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(mapResponse('emergency_number', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_emergencias', requestMapper('emergency_number'), async (req, res) => {
    try {
        const data = await prisma.numeroEmergencia.create({ data: req.body });
        res.status(201).json(mapResponse('emergency_number', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestro_emergencias/:id', requestMapper('emergency_number'), async (req, res) => {
    try {
        const data = await prisma.numeroEmergencia.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('emergency_number', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_emergencias/:id', async (req, res) => {
    try {
        await prisma.numeroEmergencia.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Comunicaciones y Plantillas ---
app.get('/api/maestro_mensajes', async (req, res) => {
    try {
        const data = await prisma.plantillaComunicacion.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(mapResponse('communication_template', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_mensajes', requestMapper('communication_template'), async (req, res) => {
    try {
        const data = await prisma.plantillaComunicacion.create({ data: req.body });
        res.status(201).json(mapResponse('communication_template', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestro_mensajes/:id', requestMapper('communication_template'), async (req, res) => {
    try {
        const data = await prisma.plantillaComunicacion.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('communication_template', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_mensajes/:id', async (req, res) => {
    try {
        await prisma.plantillaComunicacion.update({ 
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/communication_history', async (req, res) => {
    try {
        const data = await prisma.communicationHistory.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(mapResponse('communication', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communication_history', requestMapper('communication'), async (req, res) => {
    try {
        const data = await prisma.communicationHistory.create({ data: req.body });
        res.status(201).json(mapResponse('communication', data));
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
        const data = await prisma.proyeccionIPC.findMany({ where: { isActive: true } });
        res.json(mapResponse('ipc_projection', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestro_ipc', requestMapper('ipc_projection'), async (req, res) => {
    try {
        const data = await prisma.proyeccionIPC.create({ data: req.body });
        res.status(201).json(mapResponse('ipc_projection', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestro_ipc/:id', requestMapper('ipc_projection'), async (req, res) => {
    try {
        const data = await prisma.proyeccionIPC.update({ 
            where: { id: req.params.id }, 
            data: req.body 
        });
        res.json(mapResponse('ipc_projection', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestro_ipc/:id', async (req, res) => {
    try {
        await prisma.proyeccionIPC.update({ 
            where: { id: req.params.id }, 
            data: { isActive: false } 
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Infrastructure Items
app.get('/api/infraestructura', async (req, res) => {
    try {
        res.json(await prisma.itemInfraestructura.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/infraestructura', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.itemInfraestructura.create({ 
            data: { nombre: name || req.body.nombre, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/infraestructura/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.itemInfraestructura.update({ 
            where: { id: req.params.id }, 
            data: { nombre: name || req.body.nombre, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/infraestructura/:id', async (req, res) => {
    try {
        await prisma.itemInfraestructura.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Equipment Items
app.get('/api/equipamiento', async (req, res) => {
    try {
        res.json(await prisma.itemEquipamiento.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipamiento', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.itemEquipamiento.create({ 
            data: { nombre: name || req.body.nombre, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/equipamiento/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.itemEquipamiento.update({ 
            where: { id: req.params.id }, 
            data: { nombre: name || req.body.nombre, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/equipamiento/:id', async (req, res) => {
    try {
        await prisma.itemEquipamiento.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// System Parameters (Maestros Varias)
app.get('/api/maestros_operativos', async (req, res) => {
    try {
        const data = await prisma.parametroSistema.findMany({ 
            where: { isActive: true },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(mapResponse('system_parameter', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/maestros_operativos', requestMapper('system_parameter'), async (req, res) => {
    try {
        const data = await prisma.parametroSistema.create({ data: req.body });
        res.status(201).json(mapResponse('system_parameter', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maestros_operativos/:id', requestMapper('system_parameter'), async (req, res) => {
    try {
        const data = await prisma.parametroSistema.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('system_parameter', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maestros_operativos/:id', async (req, res) => {
    try {
        await prisma.parametroSistema.update({ 
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// AFC
app.get('/api/afc', async (req, res) => {
    try {
        const data = await prisma.afc.findMany({ where: { isArchived: false } });
        res.json(mapResponse('afc', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/afc', requestMapper('afc'), async (req, res) => {
    try {
        const data = await prisma.afc.create({ data: req.body });
        res.status(201).json(mapResponse('afc', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/afc/:id', requestMapper('afc'), async (req, res) => {
    try {
        const data = await prisma.afc.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('afc', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/afc/:id', async (req, res) => {
    try {
        await prisma.afc.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Holidays
app.get('/api/feriados', async (req, res) => {
    try {
        const data = await prisma.feriado.findMany({ where: { isArchived: false }, orderBy: { date: 'asc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feriados', async (req, res) => {
    try {
        const data = await prisma.feriado.create({ 
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
        const data = await prisma.feriado.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/feriados/:id', async (req, res) => {
    try {
        await prisma.feriado.update({
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
app.put('/api/previsiones/:id', requestMapper('health_provider'), async (req, res) => {
    try {
        const data = await prisma.healthProvider.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('health_provider', data));
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
app.put('/api/bancos/:id', requestMapper('bank'), async (req, res) => {
    try {
        const data = await prisma.banco.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('bank', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/bancos/:id', async (req, res) => {
    try {
        await prisma.banco.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Pension Funds (AFPs) - PUT & DELETE missing ---
app.put('/api/afps/:id', requestMapper('pension_fund'), async (req, res) => {
    try {
        const data = await prisma.pensionFund.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('pension_fund', data));
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
        const data = await prisma.condicionEspecial.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' } 
        });
        res.json(mapResponse('special_condition', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/condiciones_especiales', requestMapper('special_condition'), async (req, res) => {
    try {
        const data = await prisma.condicionEspecial.create({ data: req.body });
        res.status(201).json(mapResponse('special_condition', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/condiciones_especiales/:id', requestMapper('special_condition'), async (req, res) => {
    try {
        const data = await prisma.condicionEspecial.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('special_condition', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/condiciones_especiales/:id', async (req, res) => {
    try {
        await prisma.condicionEspecial.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Unit Types (Tipos de Unidad) - Migrado a Mapper v1.0 ---
app.get('/api/tipos_unidad', async (req, res) => {
    try {
        const data = await prisma.tipoUnidad.findMany({ where: { isArchived: false } });
        res.json(mapResponse('unit_type', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tipos_unidad', requestMapper('unit_type'), async (req, res) => {
    try {
        // req.body YA llega en camelCase (nombre, baseCommonExpense) y serializado
        const data = await prisma.tipoUnidad.create({ data: req.body });
        res.status(201).json(mapResponse('unit_type', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/tipos_unidad/:id', requestMapper('unit_type'), async (req, res) => {
    try {
        const data = await prisma.tipoUnidad.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('unit_type', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/tipos_unidad/:id', async (req, res) => {
    try {
        await prisma.tipoUnidad.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Common Spaces (Espacios Comunes) ---
app.get('/api/espacios', async (req, res) => {
    try {
        const data = await prisma.espacioComun.findMany({ where: { isArchived: false } });
        res.json(mapResponse('common_space', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/espacios', requestMapper('common_space'), async (req, res) => {
    try {
        const data = await prisma.espacioComun.create({ data: req.body });
        res.status(201).json(mapResponse('common_space', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/espacios/:id', requestMapper('common_space'), async (req, res) => {
    try {
        const data = await prisma.espacioComun.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('common_space', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/espacios/:id', async (req, res) => {
    try {
        await prisma.espacioComun.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Parking (Estacionamientos) - full CRUD missing ---
app.get('/api/estacionamientos', async (req, res) => {
    try {
        const data = await prisma.estacionamiento.findMany({ 
            where: { isArchived: false },
            include: { department: true }
        });
        res.json(mapResponse('parking', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/estacionamientos', requestMapper('parking'), async (req, res) => {
    try {
        const data = await prisma.estacionamiento.create({ data: req.body });
        res.status(201).json(mapResponse('parking', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/estacionamientos/:id', requestMapper('parking'), async (req, res) => {
    try {
        const data = await prisma.estacionamiento.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('parking', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/estacionamientos/:id', async (req, res) => {
    try {
        await prisma.estacionamiento.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Residents - PUT & DELETE missing ---
app.put('/api/residents/:id', requestMapper('resident'), async (req, res) => {
    try {
        const data = await prisma.residente.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('resident', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/residents/:id', async (req, res) => {
    try {
        await prisma.residente.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Expenses (Egresos) ---
app.get('/api/expenses', authorize('expenses:manage'), async (req, res) => {
    try {
        const data = await prisma.communityExpense.findMany({
            where: { isArchived: false },
            orderBy: { date: 'desc' }
        });
        res.json(mapResponse('expense', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/expenses', authorize('expenses:manage'), requestMapper('expense'), async (req, res) => {
    try {
        if ((req.body.amount || 0) <= 0) {
            return res.status(400).json({ error: 'El monto del egreso debe ser mayor a 0' });
        }
        const data = await prisma.communityExpense.create({ data: req.body });
        res.status(201).json(mapResponse('expense', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/expenses/:id', requestMapper('expense'), async (req, res) => {
    try {
        const data = await prisma.communityExpense.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('expense', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await prisma.communityExpense.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Alias para compatibilidad temporal
app.get('/api/community_expenses', (req, res) => res.redirect(307, '/api/expenses'));
app.post('/api/community_expenses', (req, res) => res.redirect(307, '/api/expenses'));

// --- Charge Rules (5.5.3) ---
app.get('/api/charge_rules', async (req, res) => {
    try {
        const data = await prisma.chargeRule.findMany({
            where: { isArchived: false }
        });
        res.json(mapResponse('charge_rule', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/charge_rules', requestMapper('charge_rule'), async (req, res) => {
    try {
        const data = await prisma.chargeRule.create({ data: req.body });
        res.status(201).json(mapResponse('charge_rule', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/charge_rules/:id', requestMapper('charge_rule'), async (req, res) => {
    try {
        const data = await prisma.chargeRule.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('charge_rule', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/charge_rules/:id', async (req, res) => {
    try {
        await prisma.chargeRule.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Payments (Abonos) ---
app.get('/api/payments', authorize('payments:view'), async (req, res) => {
    const where = { isArchived: false };
    if (!req.isAdmin) {
        // Resident only sees their payments
        where.residentId = req.user.id;
    }
    try {
        const data = await prisma.payment.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(mapResponse('payment', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/payments', authorize('payments:create'), requestMapper('payment'), async (req, res) => {
    try {
        const { commonExpensePaymentId, amount } = req.body;
        if (!amount || amount <= 0) throw new Error('El monto del pago debe ser mayor a 0');

        // Security: Ownership check for the associated debt
        const debt = await prisma.commonExpensePayment.findUnique({
            where: { id: commonExpensePaymentId },
            include: { department: true }
        });

        if (!debt) throw new Error('Deuda no encontrada');

        if (!req.isAdmin) {
            // Check if this debt belongs to the resident
            if (debt.department.residentId !== req.user.id && debt.department.ownerId !== req.user.id) {
                console.warn(`[SECURITY] [${new Date().toISOString()}] FRAUD ATTEMPT: User ${req.user.id} tried to pay debt ${debt.id} of another user.`);
                return res.status(403).json({ error: 'No tienes permiso para pagar esta deuda' });
            }
        }
        
        req.body.residentId = req.user.id; 
        req.body.departmentId = debt.departmentId;

        const prevPayments = await prisma.payment.findMany({
            where: { commonExpensePaymentId, isArchived: false }
        });
        const totalPaidSoFar = prevPayments.reduce((acc, p) => acc + p.amount, 0);
        const newTotalPaid = totalPaidSoFar + amount;

        let newStatus = 'partial';
        if (newTotalPaid >= debt.amountPaid) {
            newStatus = 'paid';
        }

        const [paymentRecord] = await prisma.$transaction([
            prisma.payment.create({ data: req.body }),
            prisma.commonExpensePayment.update({
                where: { id: commonExpensePaymentId },
                data: { status: newStatus }
            })
        ]);

        await audit(req, 'CREATE_PAYMENT', 'Payment', { paymentId: paymentRecord.id, amount: amount });

        res.status(201).json(mapResponse('payment', paymentRecord));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/payments/:id', async (req, res) => {
    try {
        const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
        if (!payment) throw new Error('Pago no encontrado');

        await prisma.$transaction([
            prisma.payment.update({
                where: { id: req.params.id },
                data: { isArchived: true }
            }),
            // Restore partial/paid status might be complex, for now we just archive.
        ]);
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
        res.json(mapResponse('department', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments', requestMapper('department'), async (req, res) => {
    try {
        const data = await prisma.department.create({ data: req.body });
        res.status(201).json(mapResponse('department', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/departments/:id', requestMapper('department'), async (req, res) => {
    try {
        const data = await prisma.department.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('department', data));
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
        const data = await prisma.propietario.findMany({ 
            where: { isArchived: false },
            include: {
                departments: {
                    include: {
                        tower: true
                    }
                }
            }
        });
        res.json(mapResponse('owner', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/owners', requestMapper('owner'), async (req, res) => {
    try {
        const data = await prisma.propietario.create({ data: req.body });
        res.status(201).json(mapResponse('owner', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/owners/:id', requestMapper('owner'), async (req, res) => {
    try {
        const data = await prisma.propietario.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('owner', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/owners/:id', async (req, res) => {
    try {
        await prisma.propietario.update({
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
        res.json(mapResponse('camera', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cameras', requestMapper('camera'), async (req, res) => {
    try {
        const data = await prisma.camera.create({ data: req.body });
        res.status(201).json(mapResponse('camera', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/cameras/:id', requestMapper('camera'), async (req, res) => {
    try {
        const data = await prisma.camera.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('camera', data));
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
        const data = await prisma.entregaArticulo.findMany({
            where: { status: { not: 'archived' } },
            include: { personnel: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(mapResponse('inventory_item', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/article_deliveries', requestMapper('inventory_item'), async (req, res) => {
    try {
        const data = await prisma.entregaArticulo.create({ data: req.body });
        res.status(201).json(mapResponse('inventory_item', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/article_deliveries/:id', requestMapper('inventory_item'), async (req, res) => {
    try {
        const data = await prisma.entregaArticulo.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('inventory_item', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/article_deliveries/:id', async (req, res) => {
    try {
        await prisma.entregaArticulo.update({
            where: { id: req.params.id },
            data: { status: 'archived' }
        });
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
            const exists = await prisma.itemInfraestructura.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.itemInfraestructura.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.itemInfraestructura.create({ data: { nombre: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
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
            const exists = await prisma.itemEquipamiento.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.itemEquipamiento.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.itemEquipamiento.create({ data: { nombre: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
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
            const exists = await prisma.espacioComun.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.espacioComun.update({ where: { id: exists.id }, data: { location: row.ubicacion || row.location || exists.location } }); updated++; }
            else { if (!isDry) await prisma.espacioComun.create({ data: { nombre: row.nombre || row.name, location: row.ubicacion || row.location || 'Sin ubicación', rentalValue: parseFloat(row.valor_arriendo || 0), durationHours: parseInt(row.duracion_horas || 1) } }); created++; }
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
            const exists = await prisma.feriado.findFirst({ where: { date } });
            if (exists) { if (!isDry) await prisma.feriado.update({ where: { id: exists.id }, data: { description } }); updated++; }
            else { if (!isDry) await prisma.feriado.create({ data: { date, description } }); created++; }
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
            const exists = await prisma.proyeccionIPC.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.proyeccionIPC.update({ where: { id: exists.id }, data: { ipcRate: parseFloat(row.tasa_ipc || row.ipcRate || exists.ipcRate) } }); updated++; }
            else { if (!isDry) await prisma.proyeccionIPC.create({ data: { nombre: row.nombre || row.name, ipcRate: parseFloat(row.tasa_ipc || row.ipcRate || 0), ponderadoRate: parseFloat(row.tasa_ponderado || 0) } }); created++; }
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
            const exists = await prisma.parametroSistema.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' }, type } });
            if (exists) { if (!isDry) await prisma.parametroSistema.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.parametroSistema.create({ data: { nombre: row.nombre || row.name, type, description: row.descripcion || row.description } }); created++; }
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
            const exists = await prisma.plantillaComunicacion.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.plantillaComunicacion.update({ where: { id: exists.id }, data: { subject: row.asunto || row.subject || exists.subject, message: row.mensaje || row.message || exists.message } }); updated++; }
            else { if (!isDry) await prisma.plantillaComunicacion.create({ data: { nombre: row.nombre || row.name, subject: row.asunto || row.subject || '', message: row.mensaje || row.message || '' } }); created++; }
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
            const exists = await prisma.condicionEspecial.findFirst({ where: { nombre: { equals: name, mode: 'insensitive' } } });
            if (exists) { if (!isDry) await prisma.condicionEspecial.update({ where: { id: exists.id }, data: { description: row.descripcion || row.description } }); updated++; }
            else { if (!isDry) await prisma.condicionEspecial.create({ data: { nombre: row.nombre || row.name, description: row.descripcion || row.description } }); created++; }
        }
        res.json({ processed: items.length, created, updated, errors: [], dryRun: isDry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Condo Board (Directiva) ---
app.get('/api/condo_board', async (req, res) => {
    try {
        const data = await prisma.comite.findMany({ where: { isArchived: false } });
        res.json(mapResponse('condo_board', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/condo_board', requestMapper('condo_board'), async (req, res) => {
    try {
        const data = await prisma.comite.create({ data: req.body });
        res.status(201).json(mapResponse('condo_board', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/condo_board/:id', requestMapper('condo_board'), async (req, res) => {
    try {
        const data = await prisma.comite.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('condo_board', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/condo_board/:id', async (req, res) => {
    try {
        await prisma.comite.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- System Messages (Avisos) ---
app.get('/api/system_messages', async (req, res) => {
    try {
        const data = await prisma.aviso.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' }
        });
        res.json(mapResponse('system_announcement', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/system_messages', requestMapper('system_announcement'), async (req, res) => {
    try {
        const data = await prisma.aviso.create({ data: req.body });
        res.status(201).json(mapResponse('system_announcement', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/system_messages/:id', requestMapper('system_announcement'), async (req, res) => {
    try {
        const data = await prisma.aviso.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('system_announcement', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/system_messages/:id', async (req, res) => {
    try {
        await prisma.aviso.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Shift Reports (Daily Events) ---
app.get('/api/shift_reports', async (req, res) => {
    try {
        const data = await prisma.dailyReport.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: {
                resident: true,
                owner: true,
                department: true
            }
        });
        res.json(mapResponse('daily_report', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/shift_reports', requestMapper('daily_report'), async (req, res) => {
    try {
        const data = await prisma.dailyReport.create({ data: req.body });
        res.status(201).json(mapResponse('daily_report', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/shift_reports/:id', requestMapper('daily_report'), async (req, res) => {
    try {
        const data = await prisma.dailyReport.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('daily_report', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/shift_reports/:id', async (req, res) => {
    try {
        await prisma.dailyReport.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Shift Logs (Continuous Events) ---
app.get('/api/shift_logs', async (req, res) => {
    try {
        const { daily_report_id } = req.query;
        const where = { isArchived: false };
        if (daily_report_id) where.dailyReportId = daily_report_id;
        
        const data = await prisma.shiftLog.findMany({ 
            where,
            orderBy: { timestamp: 'asc' }
        });
        res.json(mapResponse('shift_log', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/shift_logs', requestMapper('shift_log'), async (req, res) => {
    try {
        const data = await prisma.shiftLog.create({ data: req.body });
        res.status(201).json(mapResponse('shift_log', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/shift_logs/:id', async (req, res) => {
    try {
        await prisma.shiftLog.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Visitors (Visitas) ---
app.get('/api/visitors', async (req, res) => {
    try {
        const data = await prisma.visita.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: {
                resident: true,
                department: true
            }
        });
        res.json(mapResponse('visit', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/visitors', requestMapper('visit'), async (req, res) => {
    try {
        const data = await prisma.visita.create({ data: req.body });
        res.status(201).json(mapResponse('visit', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/visitors/:id', requestMapper('visit'), async (req, res) => {
    try {
        const data = await prisma.visita.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('visit', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/visitors/:id', async (req, res) => {
    try {
        await prisma.visita.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Contractors (Personal Externo) ---
app.get('/api/contractors', async (req, res) => {
    try {
        const data = await prisma.contratistaVisita.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: { department: true }
        });
        res.json(mapResponse('contractor', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contractors', requestMapper('contractor'), async (req, res) => {
    try {
        const data = await prisma.contratistaVisita.create({ data: req.body });
        res.status(201).json(mapResponse('contractor', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/contractors/:id', requestMapper('contractor'), async (req, res) => {
    try {
        const data = await prisma.contratistaVisita.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('contractor', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/contractors/:id', async (req, res) => {
    try {
        await prisma.contratistaVisita.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Supply Requests (Solicitudes de Insumos) ---
app.get('/api/supply_requests', async (req, res) => {
    try {
        const data = await prisma.supplyRequest.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: { worker: true }
        });
        res.json(mapResponse('supply_request', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/supply_requests', requestMapper('supply_request'), async (req, res) => {
    try {
        const data = await prisma.supplyRequest.create({ data: req.body });
        res.status(201).json(mapResponse('supply_request', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/supply_requests/:id', requestMapper('supply_request'), async (req, res) => {
    try {
        const data = await prisma.supplyRequest.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('supply_request', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/supply_requests/:id', async (req, res) => {
    try {
        await prisma.supplyRequest.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- CCTV & Cameras (Seguridad) ---
app.get('/api/cameras', async (req, res) => {
    try {
        const data = await prisma.camera.findMany({ 
            where: { isArchived: false },
            orderBy: { name: 'asc' }
        });
        res.json(mapResponse('camera', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cameras', requestMapper('camera'), async (req, res) => {
    try {
        const data = await prisma.camera.create({ data: req.body });
        res.status(201).json(mapResponse('camera', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/cctv_logs', async (req, res) => {
    try {
        const { camera_id } = req.query;
        const where = { isArchived: false };
        if (camera_id) where.cameraId = camera_id;
        
        const data = await prisma.cctvLog.findMany({ 
            where,
            orderBy: { recordedAt: 'desc' },
            include: { camera: true }
        });
        res.json(mapResponse('cctv_log', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cctv_logs', requestMapper('cctv_log'), async (req, res) => {
    try {
        const data = await prisma.cctvLog.create({ data: req.body });
        res.status(201).json(mapResponse('cctv_log', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/cctv_logs/:id', async (req, res) => {
    try {
        await prisma.cctvLog.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Reservations (Reserva de Espacios) ---
app.get('/api/reservations', async (req, res) => {
    try {
        const data = await prisma.reserva.findMany({ 
            where: { isArchived: false },
            orderBy: { startAt: 'desc' },
            include: { 
                commonSpace: true,
                resident: true
            }
        });
        res.json(mapResponse('reservation', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reservations', requestMapper('reservation'), async (req, res) => {
    try {
        // Simple overlap check
        const overlap = await prisma.reserva.findFirst({
            where: {
                commonSpaceId: req.body.commonSpaceId,
                isArchived: false,
                status: { not: 'cancelled' },
                OR: [
                    {
                        startAt: { lte: req.body.startAt },
                        endAt: { gte: req.body.startAt }
                    },
                    {
                        startAt: { lte: req.body.endAt },
                        endAt: { gte: req.body.endAt }
                    }
                ]
            }
        });

        if (overlap) {
            return res.status(400).json({ error: 'El espacio ya está reservado en ese horario.' });
        }

        const data = await prisma.reserva.create({ data: req.body });
        res.status(201).json(mapResponse('reservation', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/reservations/:id', requestMapper('reservation'), async (req, res) => {
    try {
        const data = await prisma.reserva.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('reservation', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/reservations/:id', async (req, res) => {
    try {
        await prisma.reserva.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Support Tickets (Gestión de Reclamos / Centro de Ayuda) ---
app.get('/api/tickets', async (req, res) => {
    try {
        const data = await prisma.ticket.findMany({ 
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: { resident: true }
        });
        res.json(mapResponse('support_ticket', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tickets', requestMapper('support_ticket'), async (req, res) => {
    try {
        const data = await prisma.ticket.create({ data: req.body });
        res.status(201).json(mapResponse('support_ticket', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/tickets/:id', requestMapper('support_ticket'), async (req, res) => {
    try {
        const data = await prisma.ticket.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('support_ticket', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/tickets/:id', async (req, res) => {
    try {
        await prisma.ticket.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// --- Service Directory (Directorio de Servicios) ---
app.get('/api/service_directory', async (req, res) => {
    try {
        const data = await prisma.directorioServicio.findMany({ 
            where: { isArchived: false },
            orderBy: { category: 'asc' }
        });
        res.json(mapResponse('service_directory', data));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/service_directory', requestMapper('service_directory'), async (req, res) => {
    try {
        const data = await prisma.directorioServicio.create({ data: req.body });
        res.status(201).json(mapResponse('service_directory', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/service_directory/:id', requestMapper('service_directory'), async (req, res) => {
    try {
        const data = await prisma.directorioServicio.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(mapResponse('service_directory', data));
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/service_directory/:id', async (req, res) => {
    try {
        await prisma.directorioServicio.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.listen(PORT, () => {
    console.log(`🚀 SGC Full Backend en http://localhost:${PORT}`);
});

module.exports = app;
