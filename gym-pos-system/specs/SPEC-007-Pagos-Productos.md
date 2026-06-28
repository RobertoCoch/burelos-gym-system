# SPEC-007: Pagos de Productos

- **ID:** SPEC-007
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Implementar la funcionalidad completa del modal `ProductPaymentModal`, permitiendo la búsqueda, selección y cobro de uno o múltiples productos, actualizando su stock en inventario y registrando las transacciones en el historial de pagos.

## 2. Contexto
Actualmente el `ProductPaymentModal` tiene datos estáticos (mockeados). Se requiere convertirlo en un punto de venta (POS) funcional que permita buscar productos reales, elegir cantidades (respetando el stock disponible), buscar al usuario comprador y realizar el registro en la base de datos de PocketBase.

## 3. Requisitos EARS

### Fase 1: Selección de Productos (Carrito)
| Req ID | Requisito |
| --- | --- |
| REQ-PAYPROD1 | THE SYSTEM SHALL proveer un buscador de productos que se active al escribir al menos 2 letras, mostrando resultados similares (autocompletado). |
| REQ-PAYPROD2 | WHEN un producto es seleccionado del buscador, THE SYSTEM SHALL agregarlo a la lista del carrito con cantidad inicial 1. |
| REQ-PAYPROD3 | THE SYSTEM SHALL calcular automáticamente el "Total" sumando los precios de los productos multiplicados por su cantidad en el carrito. |
| REQ-PAYPROD4 | THE SYSTEM SHALL permitir modificar la cantidad de cada producto en el carrito, con un mínimo de 1 y un máximo igual al `stock` disponible de dicho producto. |
| REQ-PAYPROD5 | THE SYSTEM SHALL incluir un botón para eliminar (quitar) un producto de la lista del carrito. |
| REQ-PAYPROD6 | THE SYSTEM SHALL mantener deshabilitado el botón de escanear código de barras. |

### Fase 2: Datos del Usuario y Registro
| Req ID | Requisito |
| --- | --- |
| REQ-PAYPROD7 | THE SYSTEM SHALL proveer un buscador de usuarios que se active al escribir al menos 2 letras, mostrando resultados similares. |
| REQ-PAYPROD8 | WHEN un usuario es seleccionado, THE SYSTEM SHALL mostrarlo en el input y habilitar un botón "X" para deseleccionarlo. |
| REQ-PAYPROD9 | THE SYSTEM SHALL permitir seleccionar una fecha de pago, por defecto el día actual. |
| REQ-PAYPROD10 | THE SYSTEM SHALL mostrar un modal de confirmación (`ConfirmModal`) antes de registrar el pago. |
| REQ-PAYPROD11 | UPON registro exitoso, THE SYSTEM SHALL crear un registro en la tabla `pagos_productos` por cada tipo de producto comprado, descontar la cantidad comprada del `stock` original en la tabla `productos`, e invalidar cachés para refrescar vistas. |
| REQ-PAYPROD12 | IF el usuario intenta cerrar el modal con productos en el carrito, THEN THE SYSTEM SHALL mostrar un modal de advertencia para prevenir pérdida de datos. |

## 4. Diseño y UX
- El formulario se divide en dos fases lógicas (productos y detalles del pago), mostradas en un layout de columnas (o apilado en móviles) ya pre-diseñado.
- Uso del color corporativo amarillo (`#FFC107`) y fondo oscuro de cristal (`backdrop-blur`).
- Notificaciones Toast para feedback de éxito o error.

## 5. Archivos Afectados
- `src/features/admin-views/payments/ProductPaymentModal.tsx` (Lógica principal).
- `src/features/admin-views/payments/PaymentView.tsx` (Lectura del historial actual).
