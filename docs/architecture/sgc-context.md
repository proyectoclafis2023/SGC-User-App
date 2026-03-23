# SGC SYSTEM CONTEXT

Versión base: v2.2.6
Estado: Arquitectura estable + Motor de carga masiva implementado

---

## 🎯 PROPÓSITO

Este documento permite que cualquier entorno (local o remoto) entienda cómo operar el sistema SGC sin conocimiento previo.

---

## 📦 COMPONENTES CLAVE

1. Estructura de módulos:
   /docs/architecture/sgc-modules-full.txt

2. Estándar de desarrollo:
   /docs/architecture/sgc-module-standard.md

3. Prompt maestro:
   /docs/architecture/prompts/01-master-prompt.md

---

## 🧠 PRINCIPIOS DEL SISTEMA

* UI-first: todo campo visual debe existir en BD
* Backend-driven: la lógica vive en el servidor
* JSON obligatorio para datos complejos
* Carga masiva como fuente principal de datos
* No duplicidad de lógica entre capas

---

## ⚙️ MOTOR DE CARGA MASIVA (8.1.0)

El sistema cuenta con:

✔ Upload individual por módulo
✔ Upload masivo (multi-hoja)
✔ Dry Run (validación sin persistencia)
✔ Carga real (persistencia parcial controlada)
✔ Resolución de relaciones
✔ Mapeo centralizado
✔ Logs estructurados
✔ Normalización automática

---

## 🔁 FLUJO OPERATIVO RECOMENDADO

1. Descargar plantilla
2. Ejecutar DRY RUN
3. Corregir errores
4. Ejecutar carga real

---

## 🔗 DEPENDENCIAS ENTRE MÓDULOS

Orden recomendado:

1. Infraestructura (7.1.x)
2. Maestros base (7.2.x, 7.3.x)
3. Comunidad (5.3.x)
4. Operacionales

---

## 🚨 REGLAS CRÍTICAS

* No modificar estructura de módulos
* No saltarse validaciones
* No cargar datos sin Dry Run previo
* No crear lógica en frontend

---

## 🧩 ESTADO DEL SISTEMA

✔ Arquitectura alineada
✔ Backend consistente
✔ Carga masiva funcional
✔ Listo para expansión modular

---

## 🚀 SIGUIENTE ETAPA

* Completar export (individual + global)
* Motor de dependencias inteligente
* Migración progresiva de módulos existentes

---

## 🧠 HISTORIAL DE EVOLUCIÓN (APPEND ONLY)

⚠️ REGLA:

* No modificar contenido anterior
* Solo agregar nuevas entradas
* Cada entrada debe estar fechada
* No duplicar información existente

---

### [2026-03-22] - Normalización Canónica Módulo 7.1.2

* Módulo afectado: 7.1.2 (Tipos de Unidad)
* Cambio realizado: Implementación de la Capa de Mapeo Global y normalización total de UI a API en snake_case.
* Motivo: Eliminar deuda técnica de adaptadores manuales y establecer un patrón de referencia.
* Impacto: Alta consistencia. El módulo se convierte en el estándar de referencia para la migración del resto del sistema.
* Observaciones: Se definió la "Triple Alianza" (Excel ↔ API ↔ BD) gestionada por el Core de Mapeo. Ver [canonical-module-712.md](./canonical-module-712.md).

---

Este archivo es obligatorio para mantener coherencia del sistema en cualquier entorno.
