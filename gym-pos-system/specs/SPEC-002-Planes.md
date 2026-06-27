# SPEC-002: Planes

- **ID:** SPEC-002
- **Versión:** 1.1
- **Estado:** Activo
- **Dueño:** Roberto (o equipo de desarrollo)

## 2. Contexto
El gimnasio necesita ofrecer diferentes membresías a sus clientes, con distintos periodos de duración (mensual, anual, etc.) y precios. La funcionalidad de Planes (Membresías) permite a la administración definir los paquetes que se ofrecerán al público, permitiendo posteriormente asignar estos planes a los usuarios miembros. Esto facilita la venta, renovación y control de accesos al establecimiento mediante el backend de PocketBase.

## 3. Modelo de datos (PocketBase)

**Colección: `planes`**
- `id` (Text, Primary Key, autogenerado de 15 caracteres)
- `nombre` (Text, Not Null) // ej. 'Plan Mensual Básicos'
- `precio` (Number) // El costo del plan
- `tipo_duracion` (Select) // Valores permitidos: 'diario', 'semanal', 'quincenal', 'mensual', 'anual'
- `beneficios` (Editor) // Texto enriquecido o HTML con los beneficios del plan
- `created` (Autodate)
- `updated` (Autodate)

## 4. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-P1 | THE SYSTEM SHALL permitir listar, crear, editar y eliminar planes de membresía usando el SDK de PocketBase. |
| REQ-P2 | WHEN el administrador guarda un nuevo plan, THE SYSTEM SHALL verificar en el frontend que el precio sea mayor o igual a 0 y que el tipo de duración sea un valor válido. |
| REQ-P3 | IF un plan se intenta guardar sin un nombre, THEN THE SYSTEM SHALL mostrar un error de validación e impedir el envío de la petición a PocketBase. |
| REQ-P4 | WHERE la lista de planes es solicitada, THE SYSTEM SHALL obtener los registros de la colección `planes` de PocketBase ordenados según el requerimiento visual. |
| REQ-P5 | WHILE el usuario no tenga rol de administrador (admin), THE SYSTEM SHALL ocultar o denegar el acceso a las funciones de Crear o Editar un plan. |

## 5. Lo demás

**Rutas/Vistas (Frontend):**
- `/admin/planes` (o similar) - Vista principal de gestión de planes
- Formulario de captura para `nombre`, `precio`, `tipo_duracion` y `beneficios`.

**Servicios / PocketBase:**
- `pb.collection('planes').getList()` - Leer y listar planes
- `pb.collection('planes').create()` - Nuevo registro de plan
- `pb.collection('planes').update()` - Actualización
- `pb.collection('planes').delete()` - Eliminación del registro

**Roles:**
- **admin:** Control total (Crear, editar, eliminar, leer).
- **client:** Solo puede visualizar los planes que se le ofrecen (en un flujo de compra o información, si aplica).

**Fases:**
- **Fase 1:** CRUD de planes integrando campos estandar de PocketBase (nombre, precio, duración).
- **Fase 2:** Integración de un editor Rich Text para el campo `beneficios`.
