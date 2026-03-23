# MÓDULO CANÓNICO: 7.1.2 (Tipos de Unidad)
**Referencia Oficial para Migración Estándar SGC v2.2.4**

Este módulo representa la implementación perfecta del estándar SGC, eliminando la deuda técnica de adaptadores manuales y normalizando el flujo de datos de extremo a extremo.

---

## 1. ESTRUCTURA FINAL (TRIPLE ALIANZA)

### A. Base de Datos (Prisma)
- **Modelo:** `TipoUnidad`
- **Convención:** `camelCase` nativo de Prisma.
- **Campos:** `id`, `nombre`, `baseCommonExpense`, `defaultM2`, `isArchived`.

### B. API (Contrato de Red)
- **Formato:** `snake_case` estricto.
- **Payload:**
  ```json
  {
    "id": "cl...",
    "nombre": "Departamento",
    "base_common_expense": 45000,
    "default_m2": 65.5,
    "is_archived": false
  }
  ```

### C. Mapper (Capa Intermedia)
- **Inbound:** `requestMapper('unit_type')` intercepta el request y traduce a `camelCase` antes de que llegue a Prisma.
- **Outbound:** `mapResponse('unit_type', data)` intercepta el resultado de Prisma y traduce a `snake_case` para el cliente.
- **Ubicación:** `/sgc-backend/core/mapping/`

### D. UI (Frontend)
- **Consumo:** Directo. Ya no existen adaptadores en el Contexto ni en los Componentes.
- **Interfaces:** `UnitType` usa `base_common_expense`, `is_archived`, etc.
- **Ubicación:** `/user-crud-app/src/pages/TiposUnidadPage.tsx`

---

## 2. FLUJO DE DATOS (DATA JOURNEY)

1.  **UI (Interacción):** El usuario edita `base_common_expense` y guarda.
2.  **API (Request):** El payload se envía al servidor exactamente como está en la UI (snake_case).
3.  **Middleware (Mapper):** `requestMapper` traduce `base_common_expense` → `baseCommonExpense`.
4.  **Prisma (BD):** Ejecuta `update` con campos en `camelCase`.
5.  **Controller (Respuesta):** Obtiene resultado en `camelCase` de la base de datos.
6.  **Helper (Mapper):** `mapResponse` traduce de vuelta a `snake_case`.
7.  **UI (Render):** Recibe el objeto en `snake_case` y actualiza el estado local sin transformación manual.

---

## 3. REGLAS DE ORO DERIVADAS

1.  **UI nativa en snake_case:** El código JS/TS en el frontend debe reflejar el contrato de la API.
2.  **Prohibido Adaptadores:** No se permite realizar `map` manual en el `fetch` para cambiar nombres de llaves.
3.  **Prohibido JSON.parse manual:** El mapper gestiona automáticamente el parseo de campos con sufijo `Json` basándose en el registro.
4.  **Controllers Agnósticos:** El controlador del backend no debe conocer los nombres de los campos de la UI ni de Excel. Solo conoce la BD.

---

## 4. CHECKLIST DE MIGRACIÓN (Módulos Existentes)

Para migrar cualquier módulo al estándar canónico:

- [ ] **1. Registro:** Definir la entidad en `sgc-backend/core/mapping/registry.js`.
- [ ] **2. Backend Endpoints:**
    - Importar `requestMapper` y `mapResponse`.
    - Aplicar `requestMapper` en rutas `POST` y `PUT`.
    - Envolver toda respuesta `res.json` en `mapResponse`.
    - Eliminar lógica de parseo manual en el controlador.
- [ ] **3. Frontend Types:** Actualizar la interface en `types/index.ts` a `snake_case`.
- [ ] **4. Frontend Context:** Eliminar mappers de los métodos `fetch`, `add`, `update`.
- [ ] **5. Componentes UI:** Actualizar todos los bindings de propiedades de `camelCase` a `snake_case`.

---

**Nota:** 7.1.2 es el único módulo que garantiza compatibilidad 1:1 con el Bus de Datos Global (Carga Masiva 8.1.0).
