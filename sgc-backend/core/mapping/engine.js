/**
 * ENGINE DE MAPEO GLOBAL - SGC v2.2.4
 * Lógica de transformación bidireccional y recursiva de datos.
 */

const registry = require('./registry');

/**
 * Transforma un payload de entrada (API o Excel) a formato BD (camelCase).
 * Preserva campos desconocidos (relaciones o metadatos de Prisma).
 * Realiza validaciones estrictas de formato (Phase 5).
 */
const toCamelCase = (entityKey, payload, source = 'api') => {
    const config = registry[entityKey];
    if (!config || !payload) return payload;

    const result = { ...payload };
    config.fields.forEach(field => {
        const sourceKey = field[source];
        let value = payload[sourceKey];

        if (value !== undefined && value !== null) {
            // 1. Validar formato de decimales (Sólo para API)
            if (source === 'api' && typeof value === 'string') {
                if (value.includes(',')) {
                    throw new Error(`[FORMAT ERROR] El campo '${sourceKey}' contiene una coma (,). Usa punto (.) para decimales.`);
                }
            }

            // 2. Validar formato de fechas (Sólo para API y campos que terminen en _at o _date)
            if (source === 'api' && typeof value === 'string' && (sourceKey.endsWith('_at') || sourceKey.endsWith('_date'))) {
                // Regex para DD/MM/YYYY (restringido)
                if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
                    throw new Error(`[FORMAT ERROR] El campo '${sourceKey}' usa formato local (DD/MM/YYYY). Usa estándar ISO 8601.`);
                }
            }

            delete result[sourceKey];
            result[field.bd] = value;
        }
    });

    return result;
};

/**
 * Transforma un objeto de la BD (Prisma) a formato API (snake_case).
 * Recursividad determinística basada exclusivamente en el registro de relaciones.
 */
const toSnakeCase = (entityKey, bdRecord, visited = new WeakSet()) => {
    const config = registry[entityKey];
    if (!config || !bdRecord) return bdRecord;

    // Ciclo de protección
    if (typeof bdRecord === 'object' && bdRecord !== null) {
        if (visited.has(bdRecord)) return null; // Evitar ciclos infinitos
        visited.add(bdRecord);
    }

    const mapped = {};
    
    // 1. Mapear campos base (Escalares y JSON)
    config.fields.forEach(field => {
        if (bdRecord[field.bd] !== undefined) {
            let value = bdRecord[field.bd];

            // Deserialización automática si es JSON
            if (field.isJson && typeof value === 'string') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // console.error(`Error parsing JSON for field ${field.bd}`, e);
                }
            }
            
            mapped[field.api] = value;
        }
    });

    // 2. Mapear relaciones explícitas defined en config.relations
    if (config.relations) {
        Object.keys(config.relations).forEach(bdKey => {
            const targetEntityKey = config.relations[bdKey];
            const bdValue = bdRecord[bdKey];

            if (bdValue !== undefined && bdValue !== null) {
                // Generar nombre de clave en snake_case para la relación
                const apiRelKey = bdKey.replace(/([A-Z])/g, "_$1").toLowerCase();

                if (Array.isArray(bdValue)) {
                    // Relación 1:N o N:N
                    mapped[apiRelKey] = bdValue.map(item => toSnakeCase(targetEntityKey, item, visited)).filter(Boolean);
                } else if (typeof bdValue === 'object') {
                    // Relación 1:1 o N:1
                    mapped[apiRelKey] = toSnakeCase(targetEntityKey, bdValue, visited);
                }
            }
        });
    }

    return mapped;
};

/**
 * Prepara un objeto para ser guardado en la BD (Serialización JSON).
 */
const serializePayload = (entityKey, payload) => {
    const config = registry[entityKey];
    if (!config) return payload;

    const result = { ...payload };
    config.fields.forEach(field => {
        if (field.isJson && result[field.bd] !== undefined && typeof result[field.bd] !== 'string') {
            result[field.bd] = JSON.stringify(result[field.bd]);
        }
    });
    return result;
};

module.exports = {
    toCamelCase,
    toSnakeCase,
    serializePayload
};
