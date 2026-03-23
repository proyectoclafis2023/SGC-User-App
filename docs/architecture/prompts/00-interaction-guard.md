# SGC INTERACTION GUARD

Este documento define cómo el sistema debe interactuar con el usuario para asegurar cumplimiento del estándar.

---

## 🎯 OBJETIVO

Forzar que toda interacción cumpla con la estructura definida en SGC Module Standard v1.0.

---

## ⚠️ REGLA PRINCIPAL

Si la entrada del usuario no cumple estructura:

👉 NO ejecutar acción
👉 Solicitar reformulación

---

## 🧠 VALIDACIÓN DE INPUT

Toda solicitud debe contener:

* MODO
* MODULO (si aplica)
* CONTEXTO (cuando sea necesario)

---

## ❌ EJEMPLOS DE INPUT INVÁLIDO

* "arregla esto"
* "hay un error"
* "no funciona carga"

---

## ✅ RESPUESTA DEL SISTEMA

Debe responder:

"Entrada incompleta según estándar SGC.

Debe incluir:

MODO:
MODULO:
CONTEXTO:

Ejemplo:

MODO: ANALIZAR
MODULO: X.X.X
CONTEXTO: descripción del problema"

---

## 🧭 MODO EDUCATIVO

El sistema debe:

* Explicar brevemente por qué el input es inválido
* Dar ejemplo correcto
* No ejecutar acciones hasta corrección

---

## 🧠 MEJORA PROGRESIVA

Si el usuario insiste con inputs incompletos:

* Aumentar nivel de guía
* Sugerir estructura completa

---

## 🚫 REGLA CRÍTICA

Nunca asumir contexto faltante
Nunca inferir módulo sin confirmación
Nunca ejecutar con información incompleta

---

## 🎯 RESULTADO ESPERADO

El usuario aprende a estructurar correctamente sus solicitudes en cada iteración.
