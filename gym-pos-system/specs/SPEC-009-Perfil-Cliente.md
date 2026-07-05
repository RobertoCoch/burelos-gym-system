# SPEC-009: Vista de Perfil de Cliente

- **ID:** SPEC-009
- **Versión:** 1.0
- **Estado:** En desarrollo
- **Dueño:** Roberto / Equipo de Desarrollo

## 1. Objetivo
Desarrollar la pantalla principal de "Perfil" para los usuarios con rol de cliente. Esta vista servirá como su panel central donde podrán ver rápidamente su información personal, el estado de su membresía y su historial de pagos/compras. Todo esto implementado en 3 fases: Maquetación, Lógica de BD, y Pruebas.

## 2. Contexto
Actualmente, el sistema cuenta con vistas administrativas que gestionan el registro de membresías y pagos. Los clientes requieren una vista móvil dedicada que resuma sus compras y el estado de su acceso al gimnasio. Se ha proporcionado un diseño en Figma con estilo "glassmorphism" oscuro que debe ser replicado utilizando los iconos oficiales del proyecto (react-icons).

## 3. Requisitos EARS

### Fase 1: Diseño y Maquetación
| Req ID | Requisito |
| --- | --- |
| REQ-PERC1 | THE SYSTEM SHALL mostrar un avatar grande con las iniciales o foto del usuario, seguido de su nombre y un botón para editar. |
| REQ-PERC2 | THE SYSTEM SHALL mostrar una tarjeta de "Membresía" que indique el nombre del plan, estado (color), fecha de vencimiento y los días restantes. |
| REQ-PERC3 | THE SYSTEM SHALL mostrar una sección de "Compras Recientes" con botones de filtro y tarjetas de historial. |
| REQ-PERC4 | THE SYSTEM SHALL usar los iconos oficiales del proyecto (`MdOutlineWorkspacePremium` para membresías y `FaCartShopping` para productos). |

### Fase 2: Conexión Real a PocketBase
| Req ID | Requisito |
| --- | --- |
| REQ-PERC5 | THE SYSTEM SHALL consultar la tabla `membresias_activas` para obtener el estado real del usuario logueado en base a su ID. |
| REQ-PERC6 | THE SYSTEM SHALL consultar y unificar los historiales de `pagos_membresias` y `pagos_productos` del usuario, ordenados de más reciente a más antiguo. |
| REQ-PERC7 | THE SYSTEM SHALL calcular dinámicamente los "días restantes" de la membresía comparando la `fecha_vencimiento` contra la fecha actual. |

### Fase 3: Pruebas y Casos Límite
| Req ID | Requisito |
| --- | --- |
| REQ-PERC8 | THE SYSTEM SHALL mostrar un indicador visual de carga (loading) mientras se obtienen los datos de la base de datos. |
| REQ-PERC9 | THE SYSTEM SHALL mostrar mensajes amigables de estado vacío (Empty States) si el usuario no tiene membresía activa o no ha hecho compras. |
| REQ-PERC10 | THE SYSTEM SHALL restringir las consultas para asegurar que solo se obtiene la información del usuario autenticado actualmente (`pb.authStore.model.id`). |

## 4. Diseño y UX
- El diseño usará clases de TailwindCSS que imitan el glassmorphism: fondos oscuros translúcidos (`bg-[#1A1F2E]/80`), bordes sutiles y desenfoque (`backdrop-blur-xl`).
- **Colores de estado:** Verde (`text-green-400`) para membresías activas, amarillo para prontas a vencer y rojo para vencidas.
- **Botones de filtro:** Estilo de píldora interactiva que cambia de color al ser seleccionado.
- **Tipografía:** Textos gruesos (`font-extrabold`) para los títulos, montos monetarios y nombres de artículos para dar jerarquía.

## 5. Archivos Afectados
- `src/features/users/client-views/PerfilClient.tsx` (Maquetación principal y lógica de React Query).
- Rutas asociadas a la navegación del cliente (en caso de requerirse).
