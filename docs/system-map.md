# Mapa Global del Sistema (SGC)

## 1. CAPAS OPERATIVAS
- **Infraestructura:** Gestión de torres, departamentos y tipos de unidades.
- **Comunidad:** Gestión de copropietarios y residentes.
- **Operaciones:** Libro de novedades, rondas, seguridad y bitácoras.
- **Servicios:** Reservas de espacios comunes y tickets de soporte.
- **Finanzas:** Gastos comunes, proyecciones de IPC y pagos.
- **Seguridad:** Control de accesos (visitantes, contratistas) y cámaras (CCTV).

## 2. ENTIDADES PRINCIPALES

(Listado basado en `prisma/schema.prisma`)

- `Banco (Bank)`, `PensionFund`, `HealthProvider`
- `TipoUnidad (UnitType)`, `Tower`, `Department`
- `Propietario (Owner)`, `Residente (Resident)`
- `Personnel`, `Role`, `Permission`, `AuditLog`
- `JornadaGroup`, `ProyeccionIPC`, `Articulo (Article)`, `Correspondence`
- `Estacionamiento (Parking)`, `CommonExpense`, `CommonExpensePayment`
- `SpecialFund`, `NumeroEmergencia`, `PlantillaComunicacion`
- `ParametroSistema`, `Feriado`, `EspacioComun (CommonSpace)`
- `ChargeRule`, `Payment`, `SystemSettings`, `EntregaArticulo (ArticleDelivery)`
- `Camera`, `FixedAsset`, `BulkUploadLog`, `Comite`, `Aviso`
- `DailyReport`, `ShiftLog`, `Visita (Visitor)`, `ContratistaVisita`
- `SupplyRequest`, `CctvLog`, `Reserva (Reservation)`, `Ticket (SupportTicket)`
- `DirectorioServicio (ServiceDirectory)`

## 3. RELACIONES CLAVE
- **Pagos:** `payment` → `common_expense_payment` → `department`.
- **Reservas:** `reservation` → `resident` + `common_space`.
- **Visitas:** `visit` → `resident` + `department`.

## 4. FLUJOS CRÍTICOS

### FLUJO FINANCIERO:
1.  **Gasto Común Generado (`common_expense`):** Definición del periodo y monto total.
2.  **Cobro por Departamento (`common_expense_payment`):** Cálculo y registro de deuda (estado `unpaid`).
3.  **Registro de Pago (`payment`):** Pago total o parcial por parte del residente.
4.  **Estado Actualizado:** Transición de deuda (`unpaid` → `partial` → `paid`).

## 5. REGLA GLOBAL
Cada **Formulario UI** se conecta a un **Endpoint API** específico que manipula una **Entidad Prisma**.
