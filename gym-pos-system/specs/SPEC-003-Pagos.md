# SPEC-003: Pagos de Membresía

- **ID:** SPEC-003
- **Versión:** 1.0
- **Estado:** Implementado
- **Dueño:** Roberto (o equipo de desarrollo)

## 2. Contexto
El gimnasio necesita registrar los pagos que realizan sus clientes o invitados por concepto de membresías o pases temporales. Cuando un usuario registrado (cliente) realiza un pago, el sistema debe registrar el ingreso en el historial financiero y al mismo tiempo habilitar o extender su acceso al gimnasio activando su membresía. Esta *feature* se encarga de procesar el pago desde la interfaz administrativa, calculando la fecha de vencimiento con base en el tipo de plan y reflejando estos cambios en tiempo real.

## 3. Modelo de datos (PocketBase)

Para esta funcionalidad interactuaremos principalmente con 3 colecciones:

**Colección: `planes` (Solo Lectura)**
- `id`, `nombre`, `precio`, `tipo_duracion` (diario, semanal, quincenal, mensual, anual)

**Colección: `pagos_membresias` (Historial financiero)**
- `id`
- `usuario` (Relation -> users, null si es invitado)
- `es_invitado` (Bool)
- `plan` (Relation -> planes)
- `monto_cobrado` (Number)
- `metodo_pago` (Select: 'efectivo', 'transferencia')
- `fecha_pago` (Date)
- `created`, `updated`

**Colección: `membresias_activas` (Control de acceso)**
- `id`
- `usuario` (Relation -> users)
- `plan` (Relation -> planes)
- `fecha_inicio` (Date)
- `fecha_vencimiento` (Date)
- `estado` (Select: 'activa', 'vencida')
- `created`, `updated`

## 4. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-P1 | THE SYSTEM SHALL permitir registrar un pago de membresía, ya sea vinculándolo a un usuario existente o marcándolo como "Invitado". |
| REQ-P2 | WHEN se selecciona un plan en el formulario, THE SYSTEM SHALL autocompletar el "monto cobrado" con el precio de dicho plan, permitiendo modificación manual. |
| REQ-P3 | WHEN un pago es registrado exitosamente, THE SYSTEM SHALL insertar un registro en la colección `pagos_membresias`. |
| REQ-P4 | IF el pago es para un usuario registrado (no invitado), THEN THE SYSTEM SHALL buscar si el usuario tiene una membresía activa previa. Si la tiene, debe actualizarla; si no, crear un nuevo registro en `membresias_activas`. |
| REQ-P5 | WHEN se crea o actualiza una membresía en `membresias_activas`, THE SYSTEM SHALL calcular automáticamente la `fecha_vencimiento` sumando la duración del plan (`tipo_duracion`) a la fecha de inicio. |

## 5. Implementación (Lo demás)

**Archivos afectados:**
- `src/features/admin-views/payments/MembershipPaymentModal.tsx`

**Lógica de Fechas (Cálculo de Vencimiento):**
Al registrar el pago, se evaluará el campo `tipo_duracion` del plan seleccionado:
- `diario`: + 1 día
- `semanal`: + 7 días
- `quincenal`: + 15 días
- `mensual`: + 1 mes
- `anual`: + 1 año

**Transacciones PocketBase (Lógica del Modal):**
1. Recolectar datos del formulario: Usuario (o checkbox de invitado), Plan, Monto, Método de pago.
2. Hacer el POST a `pagos_membresias`.
3. Si `es_invitado` es `false`, obtener el `tipo_duracion` del plan.
4. Consultar `membresias_activas` filtrando por el `usuario.id`.
   - **Si existe un registro:** Actualizar (`pb.collection('membresias_activas').update(...)`) la `fecha_inicio` (hoy), `fecha_vencimiento` (calculada), el `plan.id` y `estado = 'activa'`.
   - **Si no existe:** Crear (`pb.collection('membresias_activas').create(...)`) con los mismos datos.
5. Invalidar cachés de React Query para refrescar las vistas de "Usuarios" y "Dashboard".
