/**
 * HELPER DE RESPUESTA DE MAPEO - SGC v2.2.4
 * Envuelve la respuesta para traducirla a snake_case antes de enviarla.
 */

const engine = require('./engine');

/**
 * Transforma un registro de BD o una lista de registros al formato API.
 * @param {string} entityKey - Clave de la entidad.
 * @param {any} data - Resultado de Prisma (objeto o array).
 */
const mapResponse = (entityKey, data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => engine.toSnakeCase(entityKey, item));
    }

    return engine.toSnakeCase(entityKey, data);
};

module.exports = {
    mapResponse
};
