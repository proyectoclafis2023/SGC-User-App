# MASTER PROMPT SGC

SISTEMA SGC v2.2.5 – CONTEXTO OPERATIVO

Estás trabajando sobre el sistema SGC.

---

FUENTES DE VERDAD (OBLIGATORIAS):

1. Listado de módulos:
   /docs/architecture/sgc-modules-full.txt

2. Estándar de desarrollo:
   /docs/architecture/sgc-module-standard.md

---

REGLA DE USO DE CONTEXTO (CRÍTICA):

Antes de cualquier análisis o acción:

* Leer ambos archivos completamente
* Utilizarlos como base para toda decisión

Si existe contradicción entre el sistema y estos archivos:

* Priorizar SIEMPRE los archivos de arquitectura

---

INTERPRETACIÓN:

* sgc-modules-full.txt define QUÉ módulos existen
* sgc-module-standard.md define CÓMO deben construirse

---

REGLAS ABSOLUTAS:

* NO inventar módulos, códigos ni rutas
* NO modificar nombres del archivo de módulos
* TODO módulo debe cumplir el estándar
* UI-first: todo campo visual debe existir en BD
* Campos complejos → String con sufijo Json
* Serialización obligatoria (JSON.stringify / JSON.parse)
* Compatibilidad total con 8.1.0 (Carga Masiva)

---

MODOS DE OPERACIÓN:

---

MODO: ANALIZAR

Entrada:
MODULO: X.X.X

Salida:

* Estado (COMPLETO / PARCIAL / NO EXISTE)
* UI / API / BD / 8.1.0
* Problemas detectados

---

MODO: MIGRAR

Entrada:
MODULO: X.X.X

Acción:

* Alinear UI ↔ API ↔ BD
* Completar CRUD
* Corregir rutas
* Implementar serialización JSON
* Integrar con 8.1.0

---

MODO: CREAR

Entrada:
MODULO: X.X.X

Acción:

* Crear modelo Prisma según estándar
* Crear API (CRUD + JSON)
* Crear UI (formulario completo)
* Integrar con carga masiva

---

MODO: AUDITORIA

Acción:

* Revisar TODOS los módulos

* Detectar:

  * desalineaciones
  * campos faltantes
  * errores JSON
  * endpoints faltantes

* Clasificar:

  * OK
  * PARCIAL
  * CRÍTICO

---

MODO: AUTO-FIX

Acción:

* Generar plan de corrección para módulos PARCIALES o CRÍTICOS
* Estandarizar:

  * BD
  * API
  * Serialización
  * Carga masiva

---

VALIDACIONES OBLIGATORIAS:

* UI = BD (1:1)
* API funcional
* JSON correcto
* Compatible con 8.1.0
* Permite crear registros

---

REGLA FINAL:

NO avanzar de módulo sin cerrarlo completamente.

---

EJECUCIÓN:

Indicar:

MODO: [ANALIZAR | MIGRAR | CREAR | AUDITORIA | AUTO-FIX]

Si aplica:

MODULO: X.X.X
