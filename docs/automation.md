# Automatización y Pruebas RBAC (SGC)

Este documento detalla la lógica funcional y técnica de la suite de pruebas automatizadas implementada en la versión v2.5.1.

## 1. Arquitectura de Pruebas
La suite reside en `/scripts/testing/rbac-test-runner.js` y utiliza `Node.js` nativo (sin dependencias externas pesadas) para garantizar la portabilidad y rapidez de ejecución.

### Objetivos
- **Verificación de Identidad**: Confirmar que todos los roles base pueden autenticarse.
- **Validación de Permisos**: Asegurar que las rutas críticas están protegidas por el middleware `authorize()`.
- **Integridad de Datos**: Validar que las respuestas de la API cumplen con el estándar `snake_case`.

## 2. Configuración de Usuarios
El script utiliza las credenciales estándar definidas en el `seed.js`:

| Rol | Email | Acción de Prueba |
| :--- | :--- | :--- |
| **Admin** | `gdcuentas@sgc.cl` | Registro de Pagos (POST `/api/common_expense_payments`) |
| **Residente** | `residente@sgc.cl` | Lectura de Pagos y Prueba de Intrusión en `/api/personal` |
| **Conserje** | `conserje@sgc.cl` | Registro de Visitas (POST `/api/visitas`) |
| **Propietario** | `propietario@sgc.cl` | Vista de Infraestructura (GET `/api/torres`) |

## 3. Lógica de Ejecución (Flow)

### Paso 1: Autenticación
El script inicia sesión para cada rol secuencialmente. El token JWT resultante se inyecta en el header `Authorization: Bearer <token>` de las subsiguientes peticiones.

### Paso 2: Delay Inteligente
Para evitar el bloqueo por **Rate Limiting (429)** en el entorno de producción o desarrollo, el script aplica un retraso aleatorio entre **800ms y 1200ms** entre cada petición.

### Paso 3: Manejo de Rate Limiting
Si el servidor responde con un código `429`, el script:
1. Registra el evento en el log.
2. Realiza un *sleep* de **30 segundos**.
3. Reintenta la última acción antes de continuar con la suite.

## 4. Interpretación de Resultados (Logs)

El archivo de salida es `/logs/rbac-test.log`. Los estados posibles son:

- **OK**: La operación se completó (200 OK o 201 Created).
- **ACCESS DENIED (EXPECTED)**: El servidor retornó 403 o 401 ante una acción no permitida para el rol actual. Validado como comportamiento seguro.
- **ACCESS GRANTED (DANGER)**: El servidor permitió el acceso a un recurso restringido. **Requiere revisión inmediata de los middlewares en index.js**.
- **FAILED (CODE)**: Error funcional (ej. 400 Bad Request por datos inválidos o 404 Not Found).

## 5. Mantenimiento
Para agregar nuevas pruebas:
1. Abrir `scripts/testing/rbac-test-runner.js`.
2. Añadir el nuevo endpoint en el bloque `ROLE SPECIFIC ACTIONS` dentro del bucle de usuarios.
3. Actualizar este documento si se introducen nuevos roles o flujos.
