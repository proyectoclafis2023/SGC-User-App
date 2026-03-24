# Guía de Creación de Módulos (SGC)

## CHECKLIST DE IMPLEMENTACIÓN

1.  **Modelo Prisma:** Crear/Actualizar el modelo en `prisma/schema.prisma`.
2.  **Registro Entidad:** Registrar la nueva entidad en `core/mapping/registry.js`.
3.  **Definir Mapping:** Especificar el mapeo de campos (`API snake_case` → `DB camelCase`) en `registry.js`.
4.  **Endpoints API:** Crear rutas en `index.js` usando los middlewares `requestMapper` y `mapResponse`.
5.  **Soft Delete:** Aplicar el filtro `isArchived: false` en las consultas `findMany` y actualizar a `true` en el borrado.
6.  **Interfaz Frontend:** Crear el modelo TypeScript en el frontend usando `snake_case`.
7.  **Contexto/Store:** Crear el contexto en `contexts/` para gestionar el estado de la entidad.
8.  **Página UI:** Crear la página del módulo en `pages/`.
9.  **Relaciones:** Validar que las relaciones (`include`) funcionen correctamente tanto en lectura como en escritura.
10. **Prueba Completa:** Realizar un ciclo CRUD (Crear, Leer, Actualizar, Borrar) y verificar la persistencia.

## REGLAS DE ORO

- **API Estandarizada:** El backend nunca debe exponer campos en `camelCase`.
- **UI Pura:** El frontend no debe transformar campos; si recibe `amount_paid`, usa `amount_paid`.
- **Lógica Centralizada:** Toda lógica de negocio pesada, validación y cálculos críticos deben residir en el backend.
