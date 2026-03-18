const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

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

// --- Root Route for confirmation ---
app.get('/', (req, res) => {
    res.send('<h1>🚀 Servidor SGC funcionando correctamente</h1><p>Prueba los endpoints en /api/...</p>');
});

// --- Helper for CSV Processing ---
const processCSV = (filePath, callback) => {
    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', () => callback(results));
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
    res.json(data);
});

app.post('/api/residents', async (req, res) => {
    try {
        const data = await prisma.resident.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/residents/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    processCSV(req.file.path, async (results) => {
        try {
            for (const row of results) {
                await prisma.resident.upsert({
                    where: { dni: row.dni || row.rut },
                    update: {
                        names: row.names || row.nombres,
                        lastNames: row.lastNames || row.apellidos,
                        phone: row.phone || row.telefono,
                        email: row.email,
                        familyCount: parseInt(row.familyCount) || 1,
                        isTenant: row.isTenant === 'true' || row.es_arrendatario === 'true',
                        rentAmount: parseFloat(row.rentAmount) || 0
                    },
                    create: {
                        names: row.names || row.nombres,
                        lastNames: row.lastNames || row.apellidos,
                        dni: row.dni || row.rut,
                        phone: row.phone || row.telefono,
                        email: row.email,
                        familyCount: parseInt(row.familyCount) || 1,
                        isTenant: row.isTenant === 'true' || row.es_arrendatario === 'true',
                        rentAmount: parseFloat(row.rentAmount) || 0
                    }
                });
            }
            fs.unlinkSync(req.file.path);
            res.json({ message: `Cargados ${results.length} residentes.` });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
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
app.get('/api/articles', async (req, res) => {
    const data = await prisma.article.findMany({ where: { isArchived: false } });
    res.json(data);
});

app.post('/api/articles', async (req, res) => {
    try {
        const data = await prisma.article.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/articles/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    processCSV(req.file.path, async (results) => {
        try {
            for (const row of results) {
                await prisma.article.create({
                    data: {
                        name: row.name || row.nombre,
                        description: row.description || row.descripcion,
                        category: row.category || row.categoria || 'otro',
                        unit: row.unit || row.unidad || 'unidades',
                        stock: parseInt(row.stock) || 0,
                        minStock: parseInt(row.minStock || row.stock_minimo) || 0,
                        price: parseFloat(row.price || row.precio) || 0,
                        allowPersonnelRequest: row.allowPersonnelRequest === 'true' || row.solicitar_personal === 'SI' || false
                    }
                });
            }
            fs.unlinkSync(req.file.path);
            res.json({ message: `Cargado inventario: ${results.length} artículos.` });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.article.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/articles/:id', async (req, res) => {
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
app.get('/api/banks', async (req, res) => {
    res.json(await prisma.bank.findMany({ where: { isArchived: false } }));
});

app.post('/api/banks', async (req, res) => {
    try {
        const data = await prisma.bank.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/pension-funds', async (req, res) => {
    res.json(await prisma.pensionFund.findMany({ where: { isArchived: false } }));
});

app.post('/api/pension-funds', async (req, res) => {
    try {
        const data = await prisma.pensionFund.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/health-providers', async (req, res) => {
    res.json(await prisma.healthProvider.findMany({ where: { isArchived: false } }));
});

app.post('/api/health-providers', async (req, res) => {
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

app.post('/api/infrastructure/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    processCSV(req.file.path, async (results) => {
        try {
            for (const row of results) {
                // row: torre; depto; tipo_unidad
                let tower = await prisma.tower.findFirst({ where: { name: row.torre, isArchived: false } });
                if (!tower) {
                    tower = await prisma.tower.create({ data: { name: row.torre } });
                }

                let unitType = await prisma.unitType.findFirst({ where: { name: row.tipo_unidad } });
                if (!unitType && row.tipo_unidad) {
                    unitType = await prisma.unitType.create({ data: { name: row.tipo_unidad, baseCommonExpense: 0 } });
                }

                await prisma.department.create({
                    data: {
                        number: row.depto,
                        towerId: tower.id,
                        unitTypeId: unitType?.id
                    }
                });
            }
            fs.unlinkSync(req.file.path);
            res.json({ message: `Cargada infraestructura: ${results.length} departamentos.` });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
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

// --- Números de Emergencia ---
app.get('/api/emergency_numbers', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/emergency_numbers', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/emergency_numbers/:id', async (req, res) => {
    try {
        const data = await prisma.emergencyNumber.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/emergency_numbers/:id', async (req, res) => {
    try {
        await prisma.emergencyNumber.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Comunicaciones y Plantillas ---
app.get('/api/communication_templates', async (req, res) => {
    try {
        const data = await prisma.communicationTemplate.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/communication_templates', async (req, res) => {
    try {
        const data = await prisma.communicationTemplate.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/communication_templates/:id', async (req, res) => {
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
app.get('/api/ipc_projections', async (req, res) => {
    try {
        res.json(await prisma.iPCProjection.findMany());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ipc_projections', async (req, res) => {
    try {
        const { name, ipcRate, ponderadoRate, description, isActive } = req.body;
        const data = await prisma.iPCProjection.create({ 
            data: { name, ipcRate, ponderadoRate: ponderadoRate || 0, description, isActive } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/ipc_projections/:id', async (req, res) => {
    try {
        const { name, ipcRate, ponderadoRate, description, isActive } = req.body;
        const data = await prisma.iPCProjection.update({ 
            where: { id: req.params.id }, 
            data: { name, ipcRate, ponderadoRate, description, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/ipc_projections/:id', async (req, res) => {
    try {
        await prisma.iPCProjection.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Infrastructure Items
app.get('/api/infrastructure_items', async (req, res) => {
    try {
        res.json(await prisma.infrastructureItem.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/infrastructure_items', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.infrastructureItem.create({ 
            data: { name, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/infrastructure_items/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.infrastructureItem.update({ 
            where: { id: req.params.id }, 
            data: { name, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/infrastructure_items/:id', async (req, res) => {
    try {
        await prisma.infrastructureItem.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Equipment Items
app.get('/api/equipment_items', async (req, res) => {
    try {
        res.json(await prisma.equipmentItem.findMany({ where: { isArchived: false } }));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/equipment_items', async (req, res) => {
    try {
        const { name, description, isMandatory } = req.body;
        const data = await prisma.equipmentItem.create({ 
            data: { name, description, isMandatory } 
        });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/equipment_items/:id', async (req, res) => {
    try {
        const { name, description, isMandatory, isActive } = req.body;
        const data = await prisma.equipmentItem.update({ 
            where: { id: req.params.id }, 
            data: { name, description, isMandatory, isActive } 
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/equipment_items/:id', async (req, res) => {
    try {
        await prisma.equipmentItem.update({ where: { id: req.params.id }, data: { isArchived: true } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// System Parameters (Maestros Varias)
app.get('/api/system_parameters', async (req, res) => {
    try {
        const data = await prisma.systemParameter.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/system_parameters', async (req, res) => {
    try {
        const data = await prisma.systemParameter.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/system_parameters/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.systemParameter.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/system_parameters/:id', async (req, res) => {
    try {
        await prisma.systemParameter.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// AFC
app.get('/api/afcs', async (req, res) => {
    try {
        const data = await prisma.afc.findMany();
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/afcs', async (req, res) => {
    try {
        const data = await prisma.afc.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/afcs/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.afc.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/afcs/:id', async (req, res) => {
    try {
        await prisma.afc.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Holidays
app.get('/api/holidays', async (req, res) => {
    try {
        const data = await prisma.holiday.findMany({ where: { isArchived: false }, orderBy: { date: 'asc' } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/holidays', async (req, res) => {
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

app.put('/api/holidays/:id', async (req, res) => {
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

app.delete('/api/holidays/:id', async (req, res) => {
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
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/system_settings', async (req, res) => {
    try {
        const data = await prisma.systemSettings.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/system_settings/:id', async (req, res) => {
    try {
        const { id, createdAt, updatedAt, ...updateData } = req.body;
        const data = await prisma.systemSettings.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Health Providers (Previsiones / Salud) - PUT & DELETE missing ---
app.put('/api/health-providers/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.healthProvider.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/health-providers/:id', async (req, res) => {
    try {
        await prisma.healthProvider.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Banks - PUT & DELETE missing ---
app.put('/api/banks/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.bank.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/banks/:id', async (req, res) => {
    try {
        await prisma.bank.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Pension Funds (AFPs) - PUT & DELETE missing ---
app.put('/api/pension-funds/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, personnel, ...updateData } = req.body;
        const data = await prisma.pensionFund.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/pension-funds/:id', async (req, res) => {
    try {
        await prisma.pensionFund.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Special Conditions (Condiciones Especiales) - full CRUD missing ---
app.get('/api/special_conditions', async (req, res) => {
    try {
        const data = await prisma.specialCondition.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/special_conditions', async (req, res) => {
    try {
        const data = await prisma.specialCondition.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/special_conditions/:id', async (req, res) => {
    try {
        const { id, createdAt, ...updateData } = req.body;
        const data = await prisma.specialCondition.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/special_conditions/:id', async (req, res) => {
    try {
        await prisma.specialCondition.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Unit Types (Tipos de Unidad) - full CRUD missing ---
app.get('/api/unit_types', async (req, res) => {
    try {
        const data = await prisma.unitType.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/unit_types', async (req, res) => {
    try {
        const { defaultM2, ...rest } = req.body;
        // defaultM2 is a frontend-only field – store it if the schema has it, otherwise ignore safely
        const data = await prisma.unitType.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/unit_types/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, departments, commonExpenseRules, defaultM2, ...updateData } = req.body;
        const data = await prisma.unitType.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/unit_types/:id', async (req, res) => {
    try {
        await prisma.unitType.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Common Spaces (Espacios Comunes) - full CRUD missing ---
app.get('/api/common_spaces', async (req, res) => {
    try {
        const data = await prisma.commonSpace.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/common_spaces', async (req, res) => {
    try {
        const data = await prisma.commonSpace.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/common_spaces/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, ...updateData } = req.body;
        const data = await prisma.commonSpace.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/common_spaces/:id', async (req, res) => {
    try {
        await prisma.commonSpace.update({
            where: { id: req.params.id },
            data: { isArchived: true }
        });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Parking (Estacionamientos) - full CRUD missing ---
app.get('/api/parking', async (req, res) => {
    try {
        const data = await prisma.parking.findMany({ where: { isArchived: false } });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/parking', async (req, res) => {
    try {
        const data = await prisma.parking.create({ data: req.body });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/parking/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, department, ...updateData } = req.body;
        const data = await prisma.parking.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/parking/:id', async (req, res) => {
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
            data: updateData
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
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments', async (req, res) => {
    try {
        const { history, ...rest } = req.body;
        const data = await prisma.department.create({ data: rest });
        res.status(201).json(data);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/departments/:id', async (req, res) => {
    try {
        const { id, createdAt, isArchived, tower, unitType, resident, owner, commonExpensePayments, correspondence, parking, history, ...updateData } = req.body;
        const data = await prisma.department.update({
            where: { id: req.params.id },
            data: updateData
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

app.listen(PORT, () => {
    console.log(`🚀 SGC Full Backend en http://localhost:${PORT}`);
});
