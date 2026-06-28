# SPEC-005: Sección de Productos

- **ID:** SPEC-005
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Crear la vista principal del catálogo de productos dentro de la sección de Inventario. Esta vista permitirá listar, buscar y filtrar los productos disponibles en el gimnasio, mostrando información esencial como nombre, stock, precio e imagen.

## 2. Contexto
El sistema ya cuenta con el módulo de Inventario y la vista de Planes. El siguiente paso en la beta es la gestión de los productos físicos (agua, proteínas, toallas, etc.). Según la "Imagen 1" proporcionada, el diseño requerido debe incluir una lista vertical de productos con tarjetas oscuras estilizadas, botones prominentes y herramientas de búsqueda rápida. 
**Nota:** El proceso de *crear* o *registrar* productos se abordará en la posterior SPEC-006, por lo que esta SPEC solo cubre la *visualización* de los productos registrados en la base de datos, aunque la tabla esté vacía por ahora.

## 3. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-PROD1 | THE SYSTEM SHALL permitir al administrador acceder a la vista de Productos al hacer clic en el botón "Productos" desde el menú principal de Inventario. |
| REQ-PROD2 | WHEN el usuario esté en la vista de Productos, THE SYSTEM SHALL mostrar un botón superior "Agregar +" (su funcionalidad de modal será implementada en SPEC-006). |
| REQ-PROD3 | THE SYSTEM SHALL incluir una barra de búsqueda y un botón "Filtrar" debajo del botón "Agregar +". |
| REQ-PROD4 | THE SYSTEM SHALL mostrar una lista de tarjetas de productos obteniendo los datos de la colección `productos` en PocketBase. |
| REQ-PROD5 | IF la colección tiene productos registrados, THEN THE SYSTEM SHALL renderizar cada producto mostrando su imagen (o un placeholder), nombre (en amarillo), texto de Stock con la cantidad, precio (en amarillo) y un botón de edición. |
| REQ-PROD6 | IF la colección está vacía, THEN THE SYSTEM SHALL mostrar un mensaje indicando que no hay productos registrados. |
| REQ-PROD7 | THE SYSTEM SHALL incluir un botón de retroceso (flecha) en la cabecera para regresar a la vista principal del Inventario. |

## 4. Diseño y Estructura de Datos

Se asumirá la existencia de una colección en PocketBase llamada `productos` con los siguientes campos tentativos:
- `id` (string, autogenerado)
- `nombre` (string)
- `descripcion` (string, opcional)
- `precio` (number)
- `stock` (number)
- `imagen` (file, opcional)
- `codigo_barras` (string, opcional)
- `categoria` (string, opcional)

### 5. Archivos Afectados
- `src/features/admin-views/inventory/InventoryView.tsx`: Actualización del estado interno para admitir `'productos'`.
- `src/features/admin-views/inventory/ProductsSubView.tsx` (NUEVO): Componente encargado de renderizar toda la lista de productos y la barra de búsqueda siguiendo el diseño propuesto.
