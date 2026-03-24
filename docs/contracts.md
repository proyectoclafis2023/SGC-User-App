# Definición Formal de Contratos (SGC)

## 1. PRINCIPIOS
- **API:** Los nombres de campos y parámetros deben estar SIEMPRE en `snake_case`.
- **Base de Datos (Prisma):** Los modelos y campos se definen en `camelCase`.
- **UI (Frontend):** Consume directamente `snake_case` desde la API sin transformaciones manuales (no usar adaptadores pesados).

## 2. FLUJO DE DATOS
`UI (React)` → `API (Express)` → `core/mapping/registry.js` → `Prisma` → `DB (SQLite)`

## 3. MOTOR DE MAPPING
- **requestMapper:** Middleware encargado de transformar la entrada (`snake_case` → `camelCase`).
- **mapResponse:** Función encargada de transformar la salida (`camelCase` → `snake_case`).

## 4. REGLAS DE CONTRATO
- **Entidad Única:** Cada entidad en el sistema tiene un contrato único definido en `registry.js`.
- **Sin Duplicidad:** No se debe duplicar la lógica de mapeo en el frontend.
- **Relaciones Explícitas:** El uso de Foreign Keys (FK) e `include` en Prisma debe ser explícito.
- **Borrado Lógico:** Uso obligatorio de `is_archived` (`soft delete`) para preservar la integridad de los datos históricos.

## 5. IMPACTO DE CAMBIOS
- **Modificar Entidad:** Requiere revisar y actualizar `registry.js`.
- **Modificar DB:** Requiere revisar el mapping en el backend.
- **Ruptura de Contrato:** Queda prohibido romper contratos existentes (cambiar nombres de campos en la API) sin incrementar la versión mayor del sistema.
