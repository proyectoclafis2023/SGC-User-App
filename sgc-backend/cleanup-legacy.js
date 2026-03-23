const fs = require('fs');
const file = '/home/sh1r0l0x/Documentos/Proyectos/SGC/sgc-backend/index.js';
let content = fs.readFileSync(file, 'utf8');

const mapping = {
    'infrastructure_items': 'infraestructura',
    'equipment_items': 'equipamiento',
    'unit_types': 'tipos_unidad',
    'common_spaces': 'espacios',
    'parking': 'estacionamientos',
    'health-providers': 'previsiones',
    'pension-funds': 'afps',
    'afcs': 'afc',
    'articles': 'articulos_personal',
    'holidays': 'feriados',
    'banks': 'bancos',
    'ipc_projections': 'maestro_ipc',
    'system_parameters': 'maestros_operativos',
    'communication_templates': 'maestro_mensajes',
    'emergency_numbers': 'maestro_emergencias',
    'special_conditions': 'condiciones_especiales'
};

for (const [legacy, standard] of Object.entries(mapping)) {
    // Remove legacy PUT
    const putRegex = new RegExp(`app\\.put\\('/api/${legacy}/:id',\\s*(async )?\\(req, res\\) => \\{[\\s\\S]*?\\n\\}\\);\\n\\n`, 'g');
    content = content.replace(putRegex, '');

    // Remove legacy DELETE
    const delRegex = new RegExp(`app\\.delete\\('/api/${legacy}/:id',\\s*(async )?\\(req, res\\) => \\{[\\s\\S]*?\\n\\}\\);\\n\\n`, 'g');
    content = content.replace(delRegex, '');
}

// Also remove test route
content = content.replace(/console\.log\('REGISTERING TEST ROUTE ALL'\);\napp\.all\('\/api\/test-bancos\/:id', \(req, res\) => res\.send\('OK ALL'\)\);\n/g, '');
content = content.replace(/console\.log\('REBOOT: index\.js is running'\);\n/g, '');

fs.writeFileSync(file, content);
console.log('Legacy endpoints removed successfully.');
