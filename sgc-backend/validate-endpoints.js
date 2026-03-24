const http = require('http');

const endpoints = [
    'infraestructura', 'equipamiento', 'tipos_unidad', 'espacios', 'estacionamientos',
    'previsiones', 'afps', 'afc', 'articulos_personal', 'feriados', 'bancos',
    'maestro_ipc', 'maestros_operativos', 'maestro_mensajes', 'maestro_emergencias', 'condiciones_especiales'
];

async function testEndpoint(modulo) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: `/api/${modulo}/12345`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 404 || data.includes('error')) {
                    resolve(true); // Exists
                } else {
                    resolve(false); // Does not exist
                }
            });
        });
        
        req.on('error', () => resolve(false));
        req.write(JSON.stringify({}));
        req.end();
    });
}

async function run() {
    console.log('Validando nuevos endpoints PUT en port 3001...');
    let allOk = true;
    for (const m of endpoints) {
        const ok = await testEndpoint(m);
        if (!ok) {
            console.log(`❌ Fallo en /api/${m}/:id`);
            allOk = false;
        } else {
            console.log(`✅ Validado /api/${m}/:id`);
        }
    }
    if (allOk) {
        console.log('\nTodos los endpoints validados correctamente. Listo para eliminar legacy.');
    }
}
run();
