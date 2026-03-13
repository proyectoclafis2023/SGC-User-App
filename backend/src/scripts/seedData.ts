import pool from '../config/db';

async function seed() {
    try {
        console.log('Starting seed...');
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Profiles & Permissions
        const profiles = [
            { id: 'trabajador', name: 'Trabajador' },
            { id: 'administrador', name: 'Administrador' },
            { id: 'residente', name: 'Residente' },
            { id: 'propietario', name: 'Propietario' }
        ];

        for (const p of profiles) {
            await pool.query('INSERT IGNORE INTO profiles (id, name) VALUES (?, ?)', [p.id, p.name]);
            const isAdmin = p.id === 'administrador';
            const isOwner = p.id === 'propietario';
            const isResident = p.id === 'residente';
            
            // 80% Residents vs 20% Owners rule implied in specific permissions
            // Only 10% of residents see arrears (we'll handle this in logic or by specific profile flag if needed, 
            // but for now we set the default permission)
            await pool.query('INSERT IGNORE INTO profile_permissions (profileId, canViewPersonnel, canManagePersonnel, canViewInfrastructure, canManageInfrastructure, canViewCommonExpenses) VALUES (?, ?, ?, ?, ?, ?)', 
                [p.id, isAdmin, isAdmin, true, isAdmin, (isAdmin || isOwner)]);
        }

        // 2. Towers (5 towers)
        const towerIds = [];
        for (let i = 1; i <= 5; i++) {
            const id = `tower-${i}`;
            await pool.query('INSERT IGNORE INTO towers (id, name) VALUES (?, ?)', [id, `Torre ${String.fromCharCode(64 + i)}`]);
            towerIds.push(id);
        }

        // 3. Unit Types
        await pool.query('INSERT IGNORE INTO unit_types (id, name, baseCommonExpense, defaultM2) VALUES (?, ?, ?, ?)', 
            ['dept-std', 'Departamento Estándar', 40000, 56]);
        await pool.query('INSERT IGNORE INTO unit_types (id, name, baseCommonExpense, defaultM2) VALUES (?, ?, ?, ?)', 
            ['local-com', 'Local Comercial', 21429, 30]);

        // 4. Owners & Residents (80 Units)
        // Rule: Even = 56m2/$40,000, Odd = 49m2/$35,000
        // Distribution: 80% residents (64), 20% owners (16)
        
        let unitCount = 0;
        for (const tId of towerIds) {
            for (let floor = 1; floor <= 4; floor++) {
                for (let unit = 1; unit <= 4; unit++) {
                    unitCount++;
                    const deptId = `dept-${unitCount}`;
                    const deptNum = `${floor}${unit < 10 ? '0'+unit : unit}`; // 101, 102...
                    
                    const isEven = unit % 2 === 0;
                    const m2 = isEven ? 56 : 49;
                    const gcommon = isEven ? 40000 : 35000;
                    
                    const isOwnerOnly = unitCount > 64; // Last 16 units are owners only (20%)
                    const canSeeArrears = unitCount <= 8; // 10% of 80 units = 8

                    const ownerId = `owner-${unitCount}`;
                    await pool.query('INSERT IGNORE INTO owners (id, names, lastNames, dni, email, status, canResidentSeeArrears) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                        [ownerId, `Propietario`, `${deptNum}`, `${unitCount}000-K`, `owner${unitCount}@example.com`, 'active', canSeeArrears]);

                    let residentId = null;
                    if (!isOwnerOnly) {
                        residentId = `res-${unitCount}`;
                        await pool.query('INSERT IGNORE INTO residents (id, names, lastNames, dni, email, status, isTenant) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                            [residentId, `Residente`, `${deptNum}`, `${unitCount}111-K`, `res${unitCount}@example.com`, 'active', (unitCount > 60)]);
                    }

                    await pool.query('INSERT IGNORE INTO departments (id, towerId, number, floor, unitTypeId, m2, value, dormitorios, banos, estacionamientos, yearBuilt, propertyRole, ownerId, residentId, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        [deptId, tId, deptNum, floor, 'dept-std', m2, gcommon, 3, 1, 1, 2021, `ROL-${deptNum}`, ownerId, residentId, (unitCount > 75)]);
                    
                    if (unitCount > 75) {
                        await pool.query('INSERT IGNORE INTO unit_publications (id, departmentId, publishType, status, price, publishDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [`pub-${unitCount}`, deptId, 'venta', 'activo', m2 * 1500000, todayStr, 'Excelente departamento nuevo.']);
                    }
                }
            }
        }

        // 5. Commercial Premises
        // 2 locales -> 30 m2 ($21.429)
        // 1 local -> 60 m2 ($42.857)
        const commercial = [
            { id: 'LC-1', num: 'LC-1', m2: 30, gc: 21429 },
            { id: 'LC-2', num: 'LC-2', m2: 30, gc: 21429 },
            { id: 'LC-3', num: 'LC-3', m2: 60, gc: 42857 }
        ];

        const commOwnerId = 'owner-comm-global';
        await pool.query('INSERT IGNORE INTO owners (id, names, lastNames, dni, email, status) VALUES (?, ?, ?, ?, ?, ?)', 
            [commOwnerId, `Inmobiliaria`, `Locales`, `76.000.000-1`, `administracion@inmobiliaria.com`, 'active']);

        for (const c of commercial) {
            const resId = `res-${c.id}`;
            await pool.query('INSERT IGNORE INTO residents (id, names, lastNames, dni, email, status) VALUES (?, ?, ?, ?, ?, ?)', 
                [resId, `Locatario`, c.num, `C-${c.id}-RES-DNI`, `${c.id}@res.com`, 'active']);
            
            await pool.query('INSERT IGNORE INTO departments (id, towerId, number, floor, unitTypeId, m2, value, dormitorios, banos, estacionamientos, yearBuilt, propertyRole, ownerId, residentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [c.id, towerIds[0], c.num, 1, 'local-com', c.m2, c.gc, 0, 1, 0, 2021, `ROL-${c.num}`, commOwnerId, resId]);
        }

        // 6. System Settings (Condo Config)
        await pool.query('UPDATE system_settings SET adminName="Marta Administración", adminRut="15.222.333-4", adminPhone="+56 9 1234 5678", condoAddress="Av. Principal 1234", condoRut="76.111.222-K" WHERE id=1');

        // 7. Workers (Personnel)
        const workers = [
            { id: 'w-day', names: 'Juan', lastNames: 'Día', shift: 'Mañana', pos: 'Conserje' },
            { id: 'w-aft', names: 'Pedro', lastNames: 'Tarde', shift: 'Tarde', pos: 'Conserje' },
            { id: 'w-night', names: 'Luis', lastNames: 'Noche', shift: 'Noche', pos: 'Conserje' },
            { id: 'w-sun', names: 'Diego', lastNames: 'Domingo', shift: 'Mañana', pos: 'Remplazo' },
            { id: 'w-admin', names: 'Marta', lastNames: 'Admin', shift: 'Mañana', pos: 'Administrador' }
        ];

        for (const w of workers) {
            await pool.query('INSERT IGNORE INTO personnel (id, names, lastNames, dni, assignedShift, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [w.id, w.names, w.lastNames, `${w.id}-dni`, w.shift, w.pos, 'active']);
        }

        // 8. Masters (Chile)
        const afps = ['Provida', 'Habitat', 'Capital', 'Cuprum', 'Modelo', 'PlanVital'];
        for (const a of afps) {
            await pool.query('INSERT IGNORE INTO pension_funds (id, name, discountRate) VALUES (?, ?, ?)', 
                [a.toLowerCase(), a, 10.5]);
        }

        const prevs = [
            { id: 'fonasa', name: 'FONASA', type: 'fonasa', rate: 7 },
            { id: 'consalud', name: 'Consalud', type: 'isapre', rate: 7 },
            { id: 'colmena', name: 'Colmena', type: 'isapre', rate: 7 },
            { id: 'banmedica', name: 'Banmédica', type: 'isapre', rate: 7 }
        ];
        for (const p of prevs) {
            await pool.query('INSERT IGNORE INTO health_providers (id, name, type, discountRate) VALUES (?, ?, ?, ?)', 
                [p.id, p.name, p.type, p.rate]);
        }

        const banks = ['Banco Estado', 'Banco de Chile', 'BCI', 'Santander', 'Scotiabank', 'Itaú'];
        for (const b of banks) {
            await pool.query('INSERT IGNORE INTO banks (id, name) VALUES (?, ?)', [b.toLowerCase().replace(/ /g, '-'), b]);
        }

        // 9. Fixed Assets
        const assets = [
            { id: 'hp-aio', desc: 'Computador HP All-in-One', qty: 1, price: 800000, model: '24-df000', notes: 'Conserjería' },
            { id: 'pc-i5', desc: 'PC escritorio i5 20GB RAM', qty: 1, price: 650000, model: 'Custom', notes: 'Administración' },
            { id: 'tv-50', desc: 'TV 50" monitoreo cámaras', qty: 1, price: 350000, model: 'Samsung 4K', notes: 'Acceso Central' },
            { id: 'mon-15', desc: '2 monitores 15" conserjería', qty: 2, price: 100000, model: 'Dell', notes: 'Auxiliares' },
            { id: 'arbustos', desc: 'Cortadora de arbustos', qty: 1, price: 150000, model: 'Stihl', notes: 'Jardinería' },
            { id: 'gen', desc: 'Generador eléctrico', qty: 1, price: 1500000, model: 'Honda', notes: 'Respaldo emergencia' },
            { id: 'ext-5', desc: '5 Extintores', qty: 5, price: 250000, model: 'ABC 6kg', notes: 'Vencimiento julio 2026', next: '2026-07-01' },
            { id: 'scaf', desc: '4 Juegos de andamios', qty: 4, price: 400000, model: 'Tubular', notes: 'Estado oxidado, sin mantención', requires: true }
        ];

        for (const a of assets) {
            await pool.query('INSERT IGNORE INTO fixed_assets (id, description, quantity, purchasePrice, model, details, requiresMaintenance, nextMaintenanceDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [a.id, a.desc, a.qty, a.price, a.model, a.notes, a.requires || false, a.next || null]);
        }

        // 10. Articles (Supplies & PPE)
        const articles = [
            { id: 'casco', name: 'Casco de seguridad', cat: 'EPP', stock: 10, price: 5000 },
            { id: 'guantes', name: 'Guantes de nitrilo', cat: 'EPP', stock: 50, price: 1500 },
            { id: 'chaleco', name: 'Chaleco reflectante', cat: 'EPP', stock: 20, price: 3000 },
            { id: 'botas', name: 'Botas de seguridad', cat: 'EPP', stock: 15, price: 25000 },
            { id: 'lentes', name: 'Lentes de protección', cat: 'EPP', stock: 30, price: 2000 }
        ];

        for (const art of articles) {
            await pool.query('INSERT IGNORE INTO articles (id, name, category, stock, price) VALUES (?, ?, ?, ?, ?)', 
                [art.id, art.name, art.cat, art.stock, art.price]);
        }

        // 11. Features Master
        const features = [
            'Accesos controlados', 'Bicicletero', 'Cámaras de seguridad', 'Estacionamiento visitas', 'Portón eléctrico', 'Quinchos', 'Áreas verdes'
        ];
        for (const f of features) {
            await pool.query('INSERT IGNORE INTO unit_features_master (id, name) VALUES (?, ?)', [f.toLowerCase().replace(/ /g, '-'), f]);
        }

        // 12. Condo Board (Directiva)
        const directiva = [
            { id: 'dir-1', name: 'Roberto Pino', rut: '10.333.444-5', phone: '988887766', pos: 'Presidente' },
            { id: 'dir-2', name: 'Ana María', rut: '12.444.555-6', phone: '977776655', pos: 'Secretaria' }
        ];
        for (const d of directiva) {
            await pool.query('INSERT IGNORE INTO condo_board (id, name, rut, phone, position) VALUES (?, ?, ?, ?, ?)', 
                [d.id, d.name, d.rut, d.phone, d.pos]);
        }

        // 13. Emergency Numbers
        const emergency = [
            { id: '133', cat: 'URGENCIA', name: 'Carabineros', phone: '133', desc: 'Emergencia Policial' },
            { id: '132', cat: 'URGENCIA', name: 'Bomberos', phone: '132', desc: 'Emergencia de Incendio / Rescate' },
            { id: '131', cat: 'SALUD', name: 'Ambulancia (SAMU)', phone: '131', desc: 'Emergencia Médica' },
            { id: '134', cat: 'URGENCIA', name: 'PDI', phone: '134', desc: 'Investigaciones' },
            { id: '1401', cat: 'COMUNAL', name: 'Seguridad Ciudadana', phone: '1401', desc: 'Patrullaje Municipal' },
            { id: 'enel', cat: 'SERVICIOS', name: 'Enel (Luz)', phone: '6006960000', desc: 'Emergencia Eléctrica' },
            { id: 'aguas', cat: 'SERVICIOS', name: 'Aguas Andinas', phone: '227312400', desc: 'Emergencia Agua / Alcantarillado' }
        ];
        for (const e of emergency) {
            await pool.query('INSERT IGNORE INTO emergency_numbers (id, category, name, phone, description) VALUES (?, ?, ?, ?, ?)', 
                [e.id, e.cat, e.name, e.phone, e.desc]);
        }

        console.log('Seed completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
