/**
 * MIDDLEWARE DE MAPEO DE ENTRADA - SGC v2.2.4
 * Intercepta y traduce payloads a formato BD.
 */

const engine = require('./engine');

/**
 * Middleware para mapear el cuerpo de la petición y los parámetros de búsqueda.
 * @param {string} entityKey - Clave de la entidad.
 */
const requestMapper = (entityKey) => {
    return (req, res, next) => {
        // Mapear el body si existe
        if (req.body && Object.keys(req.body).length > 0) {
            req.body = engine.toCamelCase(entityKey, req.body, 'api');
            // Auto-serialización para la BD (Prisma)
            req.body = engine.serializePayload(entityKey, req.body);
        }

        // Mapear query params si existen
        if (req.query && Object.keys(req.query).length > 0) {
            req.query = engine.toCamelCase(entityKey, req.query, 'api');
        }

        next();
    };
};

module.exports = {
    requestMapper
};
