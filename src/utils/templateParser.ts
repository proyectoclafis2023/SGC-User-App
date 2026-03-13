export const parseTemplate = (template: string, data: any) => {
    return template.replace(/{(\w+)}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
};

export const PUBLICATION_TEMPLATES = [
    {
        name: 'Venta Estándar',
        template: 'Oportunidad única: Unidad en {torre}, unidad {unidad}. Cuenta con {m2} m2 de superficie. Gastos comunes aproximados de {gastos_comunes}. Estado: {estado}.'
    },
    {
        name: 'Arriendo Destacado',
        template: 'Arriendo disponible en {torre}. Unidad {unidad} de {m2} m2. Ideal para familias. Gastos comunes: {gastos_comunes}. ¡Visítalo hoy!'
    },
    {
        name: 'Local Comercial',
        template: 'Local comercial L{unidad} en {torre}. Excelente ubicación con {m2} m2. Gastos comunes proporcionales: {gastos_comunes}.'
    }
];
