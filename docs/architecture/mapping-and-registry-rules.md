# SGC MAPPING & REGISTRY RULES v2.5.4

Este documento establece la normativa técnica obligatoria para la transformación de datos entre capas en el sistema SGC.

---

## 1. ESTÁNDAR DE NAMING GLOBAL (TRIPLE ALIANZA)

Toda entidad en el sistema opera bajo tres esquemas de nombres distintos pero sincronizados:

| Capa | Convención | Idioma | Ejemplo |
| :--- | :--- | :--- | :--- |
| **API (Contrato)** | `snake_case` | Inglés (preferido) | `created_at`, `rental_value` |
| **BD (Prisma)** | `camelCase` | Español / Inglés | `createdAt`, `rentalValue` |
| **Excel (Bulk)** | `Español` | Español | `fecha_creacion`, `valor_arriendo` |

---

## 2. GOBIERNO DE REGISTRY.JS

El archivo `/core/mapping/registry.js` es la única fuente de verdad para la estructura de las entidades.

### 2.1 Definición de Entidades
*   **Obligatoriedad:** Toda entidad que deba migrarse al estándar canónico DEBE estar registrada.
*   **Exclusividad:** El motor de mapeo solo procesará los campos definidos en la propiedad `fields`. Los campos extra serán ignorados por diseño.
*   **Campos JSON:** Si un campo es de tipo JSON en la base de datos (u objeto/array en Prisma), debe marcarse con `isJson: true` para que el motor gestione la (de)serialización automáticamente.

### 2.2 Relaciones Explícitas
*   **No Inferencia:** Está prohibido que el motor infiera relaciones por nombre de campo.
*   **Definición:** Las relaciones deben declararse en el objeto `relations: { bdKey: registryKey }`.
    *   `bdKey`: Nombre de la propiedad en el objeto de Prisma (ej: `unitType`).
    *   `registryKey`: Nombre de la entidad en el propio registro (ej: `unit_type`).

---

## 3. COMPORTAMIENTO DEL MOTOR DE MAPEO (ENGINE.JS)

El motor es responsable de la normalización bidireccional de los datos:

*   **Recursividad Controlada:** El motor desciende a las relaciones solo si estas han sido declaradas explícitamente en el registro.
*   **Protección de Ciclos:** El motor cuenta con un mecanismo de detección de referencias circulares para evitar desbordamiento de pila en relaciones bidireccionales (`A <-> B`).
*   **Consistencia de Claves:** Todas las claves de relación en el API deben transformarse automáticamente a `snake_case` para mantener la uniformidad del contrato.

---

## 4. RESPONSABILIDADES EN CONTROLADORES Y UI

### 4.1 Controllers (Backend)
1.  **Agnosticismo:** Los controladores no deben realizar transformaciones manuales de datos. Deben usar los middlewares `requestMapper` y los helpers `mapResponse`.
2.  **Profundidad:** El controlador es responsable de definir el `include` de Prisma para obtener los datos necesarios. El motor se encargará de mapear lo que reciba basándose en el registro.
3.  **Prohibición de JSON:** Queda estrictamente prohibido el uso de `JSON.parse` o `JSON.stringify` manual dentro de los controladores para campos persistentes.

### 4.2 Frontend (UI)
1.  **Sin Adapters:** El frontend debe consumir directamente el contrato `snake_case` de la API.
2.  **Binding Directo:** Los estados locales de React y los formularios deben usar las mismas propiedades que el API.
3.  **TypeScript:** Las interfaces de tipos (`/src/types/index.ts`) deben reflejar el contrato de la API en `snake_case`.

---

## 5. CHECKLIST DE MIGRACIÓN PARA NUEVOS MÓDULOS

Para que un módulo sea considerado "Canónico", debe cumplir:
1.  [ ] Registrado en `registry.js` con todos sus campos y relaciones.
2.  [ ] Middleware `requestMapper` aplicado en `POST` y `PUT`.
3.  [ ] Respuestas envueltas en `mapResponse`.
4.  [ ] Interfaz de TypeScript normalizada a `snake_case`.
5.  [ ] Componentes de UI actualizados para eliminar adapters antiguos.
6.  [ ] Validación exitosa de carga masiva (Excel → API → BD).

---

**Cualquier desviación de estas reglas se considerará deuda técnica crítica y deberá ser subsanada antes del cierre del ciclo de desarrollo.**
