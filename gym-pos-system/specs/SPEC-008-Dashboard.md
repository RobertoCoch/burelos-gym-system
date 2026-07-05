# SPEC-008: Dashboard Dinámico

- **ID:** SPEC-008
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Sustituir los datos de prueba (mock data) del `Dashboard.tsx` por métricas reales en tiempo real, obtenidas desde PocketBase. Las métricas incluirán ingresos, estadísticas de membresías y estado del inventario de productos.

## 2. Contexto
Actualmente, el Panel de Administrador (Dashboard) es una vista estática diseñada para mostrar el potencial del sistema. Para que la aplicación sea útil en el día a día del negocio, esta pantalla debe consolidar la información financiera y operativa calculando datos a partir de las tablas de pagos, inventario y membresías.

## 3. Requisitos EARS

### Ingresos y Finanzas
| Req ID | Requisito |
| --- | --- |
| REQ-DASH1 | THE SYSTEM SHALL calcular los "Ingresos del mes" sumando el campo `monto_cobrado` de las tablas `pagos_membresias` y `pagos_productos` correspondientes al mes actual. |
| REQ-DASH2 | THE SYSTEM SHALL calcular el porcentaje de aportación de cada categoría (Membresías vs Productos) y renderizar la barra de progreso acorde a dichos porcentajes. |
| REQ-DASH3 | THE SYSTEM SHALL calcular los ingresos totales de los últimos 5 meses (incluyendo el actual) y mostrarlos en la gráfica de barras. IF un mes no tiene registros, THEN THE SYSTEM SHALL mostrar un ingreso de 0. |

### Estado de Clientes (Membresías)
| Req ID | Requisito |
| --- | --- |
| REQ-DASH4 | THE SYSTEM SHALL contar como clientes "Activos" a los usuarios cuya membresía en `membresias_activas` tenga una fecha de vencimiento superior a 3 días desde la fecha actual. |
| REQ-DASH5 | THE SYSTEM SHALL contar como "Por vencer" a las membresías cuya fecha de vencimiento esté entre el momento actual y los próximos 3 días. |
| REQ-DASH6 | THE SYSTEM SHALL contar como "Vencidos" a las membresías cuya fecha de vencimiento ya haya pasado (fecha actual > fecha de vencimiento). |

### Inventario
| Req ID | Requisito |
| --- | --- |
| REQ-DASH7 | THE SYSTEM SHALL mostrar el total de productos únicos registrados en la tabla `productos`. |
| REQ-DASH8 | THE SYSTEM SHALL contar los productos cuyo `stock` sea menor o igual a un umbral de alerta (por defecto `1`). Este límite debe ser una variable fácilmente modificable en el código. |
| REQ-DASH9 | THE SYSTEM SHALL mantener la sección de inventario de "Equipo" en estado de "En desarrollo" y deshabilitada. |

## 4. Diseño y UX
- El diseño actual de las barras, el gráfico circular (doughnut) y los recuadros se mantiene intacto. Solo se inyectarán las variables computadas.
- Se agregará un estado de carga global (spinner o skeletons) para evitar que la interfaz parpadee o muestre ceros mientras consulta a PocketBase.
- Manejo de errores: Si una consulta falla, la métrica correspondiente mostrará "0" o "N/A" para no romper el resto de la interfaz.

## 5. Archivos Afectados
- `src/features/dashboard/components/Dashboard.tsx`
