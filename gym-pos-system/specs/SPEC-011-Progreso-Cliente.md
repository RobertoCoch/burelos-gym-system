# SPEC-011: Vista de Progreso del Cliente

- **ID:** SPEC-011
- **Versión:** 1.0
- **Estado:** En planificación
- **Dueño:** Roberto / Equipo de Desarrollo

## 1. Objetivo
Proporcionar una vista dedicada para que los clientes puedan monitorear su evolución física y consistencia en el gimnasio. La vista "Progreso" (`ProgressClient.tsx`) permitirá ver el historial de asistencias mensual y un gráfico del avance de su peso corporal. 

## 2. Contexto
Basado en el diseño proporcionado, la vista de progreso consta de dos secciones principales:
1. **Asistencias:** Un calendario mensual (visualizado mediante una cuadrícula de puntos) que indica los días que el cliente ha asistido. Existe la tabla `asistencias` en PocketBase que utilizaremos para recuperar este historial. También se incluye un botón para "Registrar Asistencia" manualmente o abrir la funcionalidad del QR.
2. **Peso Corporal / IMC:** Una sección con un gráfico de barras mensual que muestra la evolución del peso. Dado que no existe una tabla en la base de datos para esto, proponemos la creación de una nueva tabla llamada `progreso_fisico`.

## 3. Arquitectura de Base de Datos Propuesta
Se requiere crear una nueva tabla en PocketBase:

**Colección:** `progreso_fisico`
| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `id` | Record ID | Sí | Identificador único |
| `usuario` | Relation (users) | Sí | Referencia al cliente |
| `peso` | Number | Sí | Peso registrado (ej. 75.5 kg) |
| `notas` | Text | No | Notas opcionales sobre la medición |
| `created` | DateTime | Sí | Fecha de registro automático |

*(Nota: El IMC se puede agregar más adelante si solicitamos la estatura del cliente, o añadir el campo `estatura` a la tabla de `users` / `progreso_fisico`).*

## 4. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-PROG1 | THE SYSTEM SHALL mostrar un calendario de puntos por mes, coloreando de amarillo los días en los que el usuario tiene un registro en la tabla `asistencias`. |
| REQ-PROG2 | THE SYSTEM SHALL permitir al usuario cambiar de mes hacia atrás y hacia adelante para revisar su historial de asistencias. |
| REQ-PROG3 | THE SYSTEM SHALL incluir un botón "Registrar Asistencia". *(Falta definir si será un auto-registro directo a la BD o mostrará el código QR).* |
| REQ-PROG4 | THE SYSTEM SHALL mostrar un gráfico de barras con el historial de peso corporal usando la nueva tabla `progreso_fisico`, agrupado por mes/año. |
| REQ-PROG5 | THE SYSTEM SHALL proveer un botón "Registrar Peso" que abra un modal solicitando el peso actual en kilogramos para insertarlo en la BD. |

## 5. Diseño y UX
- Se usará el mismo estilo premium (glassmorphism), fondos `#111827`/`#1A1F2E` y acentos amarillos (`#FFC107`) y verdes esmeralda (`#10b981` o `#34d399`).
- Para el gráfico de peso corporal, implementaremos barras redondeadas minimalistas con las cantidades numéricas arriba, y el mes debajo, simulando el diseño proporcionado.
- Contará con controles integrados de fecha (`< Mes >` y `< Año >`).

## 6. Archivos Afectados
- `src/features/progress/ProgressClient.tsx` (Componente principal)
- `src/features/progress/components/AttendancesSection.tsx` (Subcomponente - Nuevo)
- `src/features/progress/components/WeightSection.tsx` (Subcomponente - Nuevo)
- `src/features/progress/modals/WeightModal.tsx` (Modal para registrar peso - Nuevo)
