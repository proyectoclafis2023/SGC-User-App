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

## 6. ESTÁNDARES DE DATOS (PHASE 5)
Para asegurar la integridad financiera y temporal:

### 6.1 Decimales y Números
- **Backend / API / DB:** Se utiliza SIEMPRE el punto (`.`) como separador decimal.
- **Validación:** La API rechazará cualquier valor que contenga comas (`,`).
- **Frontend:** Debe realizar la conversión de formatos de visualización locales (coma) a estándar de intercambio (punto) antes del envío.

### 6.2 Fechas y Tiempo
- **Backend / API:** Se utiliza estrictamente el formato **ISO 8601** (UTC). Ejemplo: `2026-03-24T18:30:00Z`.
- **Validación:** No se aceptan formatos regionales como `DD/MM/YYYY` en la capa de API.
- **Frontend:** Los componentes de fecha deben enviar objetos Date serializados en ISO string.

## 7. COMPORTAMIENTO DE LOGIN Y SESIÓN
### 7.1 Mapeos de Identidad (relatedId)
Para roles vinculados a unidades físicas (`resident`, `owner`):
- El login retorna un objeto `user` que incluye `relatedId`.
- **Resident:** `relatedId` apunta al ID único en la tabla `Residente`.
- **Owner:** `relatedId` apunta al ID único en la tabla `Propietario`.
- **Uso:** El dashboard utiliza este ID para filtrar departamentos y deudas asociadas.

### 7.2 Normalización de Roles
- Los roles permitidos son: `admin`, `resident`, `owner`, `concierge`.
- El rol `concierge` reemplaza al término técnico `worker` para una mejor semántica de negocio.
