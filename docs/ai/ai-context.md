# 🧠 SGC – AI CONTEXT (Fuente de Verdad Operativa)

## 🎯 PROPÓSITO

Este archivo permite que cualquier desarrollador o IA entienda cómo funciona el sistema SGC y pueda trabajar sin romper su arquitectura.

---

## 📦 FUENTES DE VERDAD (OBLIGATORIAS)

Antes de cualquier cambio, leer:

- /docs/architecture/sgc-modules-full.txt
- /docs/architecture/sgc-module-standard.md
- /docs/architecture/mapping-rules.md (o equivalente registry rules)
- /docs/contracts.md

---

## 🧠 PRINCIPIOS DEL SISTEMA

- UI-first: todo campo visible debe existir en BD
- Backend-driven: la lógica vive en el backend
- Mapping centralizado: NO hay transformación manual en frontend
- Contrato API: SIEMPRE snake_case
- Prisma/BD: camelCase
- Excel: español (carga masiva 8.1.0)

---

## 🔁 TRIPLE ALIANZA (CRÍTICO)

| Capa | Formato |
|------|--------|
| API | snake_case |
| BD (Prisma) | camelCase |
| Excel | español |

👉 El mapping SIEMPRE pasa por:
requestMapper / mapResponse

---

## 🚫 PROHIBIDO

- ❌ usar camelCase en API
- ❌ hacer `.map()` manual para cambiar nombres en frontend
- ❌ usar JSON.parse/stringify manual en controllers
- ❌ lógica de negocio en frontend
- ❌ crear endpoints fuera del patrón `/api/{modulo}`
- ❌ inferir relaciones (SIEMPRE declaradas en registry)

---

## ✔ OBLIGATORIO

- ✔ toda entidad debe estar en `/core/mapping/registry.js`
- ✔ usar requestMapper en POST/PUT
- ✔ usar mapResponse en todas las respuestas
- ✔ usar is_archived (soft delete)
- ✔ cumplir compatibilidad con carga masiva (8.1.0)

---

## 📐 ESTÁNDAR DE MÓDULOS

Todo módulo debe cumplir:

### BD (Prisma)
- id
- isArchived
- createdAt

### API
- CRUD completo
- snake_case

### UI
- sin adapters
- binding directo

### Excel
- compatible con carga masiva

---

## 🔐 SEGURIDAD

- JWT obligatorio
- RBAC activo (roles + permisos)
- NO confiar en frontend
- Validar ownership en backend

Roles actuales:

- admin (ej: gdcuentas@sgc.cl)
- resident
- owner
- concierge

---

## 🧪 TESTING

Existe script automatizado:

npm run test:rbac

Ubicación:
- /scripts/testing/rbac-test-runner.js

Log:
- /logs/rbac-test.log

Valida:

- login por rol
- acceso correcto
- bloqueo de permisos
- rate limiting

---

## 💰 FORMATO DE DATOS (CRÍTICO)

### Decimales

- Backend/API: punto (.)
- Ej: 1500.75
- Frontend puede mostrar coma, pero NO enviar coma

---

### Fechas

- API: ISO 8601
- Ej: 2026-03-24T18:30:00Z
- Frontend puede formatear para usuario

---

## 🌐 RUTAS

Formato obligatorio:

/api/{modulo}

- plural
- snake_case

---

## 🔁 FLUJO CORRECTO

UI → API → requestMapper → Prisma → DB  
DB → Prisma → mapResponse → API → UI  

---

## 🧠 REGLA DE ORO

> Si algo rompe el estándar, NO se implementa.

---

## 🚀 CÓMO TRABAJAR EN EL SISTEMA

Antes de modificar cualquier cosa:

1. Identificar módulo (según sgc-modules-full.txt)
2. Validar estándar (sgc-module-standard.md)
3. Revisar registry.js
4. Confirmar contrato en /docs/contracts.md

---

## 🧭 ESTADO ACTUAL

- Arquitectura: ✔ estable
- Mapping: ✔ centralizado
- RBAC: ✔ activo
- Testing: ✔ automatizado
- Version: v2.5.4

---

## 🧠 FRASE FINAL

> Este sistema NO depende de quien lo desarrolla.  
> Depende de que se respete su estándar.