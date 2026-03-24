# Plantilla de Módulo Antigravity (SGC)

## PLANTILLA OFICIAL DE MÓDULO

### **MÓDULO: [nombre del módulo]**

#### **OBJETIVO:**
[descripción clara del propósito del nuevo módulo]

#### **FORMULARIO:**
[nombre del componente de formulario React]

#### **CAMPOS:**
- `campo_snake_case_1`: [tipo] (ej: `string`, `number`, `boolean`)
- `campo_snake_case_2`: [tipo]
- `relation_id_fk`: [id] (clave foránea a otra entidad)

#### **ORIGEN DE DATOS:**
`GET /api/[endpoint_en_snake_case]`

#### **ENVÍO (PERSISTENCIA):**
`POST /api/[endpoint_en_snake_case]`

#### **REGLAS DE NEGOCIO:**
- [validaciones requeridas]
- [restricciones de acceso y permisos]

#### **RELACIONES RELACIONADAS:**
- `entity_relacionada_1` (ej: `tower_id`)
- `entity_relacionada_2` (ej: `resident_id`)

#### **RESULTADO ESPERADO:**
- **Persistencia:** Guardar datos correctamente en SQLite usando Prisma.
- **Formato:** Salida en `snake_case` mediante `mapResponse`.
- **Limpieza de UI:** Sin adaptadores de transformación; uso directo de los campos API.
- **Seguridad:** Middleware `authorize` aplicado si corresponde.
- **Auditoría:** Registro de creación si es relevante (`audit(req, 'CREATE_ACTION', 'Entity')`).
