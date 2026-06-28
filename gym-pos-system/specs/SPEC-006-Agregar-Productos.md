# SPEC-006: Agregar y Editar Productos

- **ID:** SPEC-006
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Implementar un formulario modal para la creación y edición de productos dentro del módulo de Inventario. Este formulario permitirá registrar nuevos artículos en la base de datos de PocketBase y modificar los existentes, activando finalmente los botones de la vista de Productos (SPEC-005).

## 2. Contexto
En la SPEC-005 se implementó la visualización del catálogo de productos. Ahora se requiere la funcionalidad para poblar y administrar ese catálogo. El formulario debe estar adaptado para dispositivos móviles, siguiendo la línea de diseño de los demás modales (pantalla completa, botones grandes, fondos oscuros).

## 3. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-ADDPROD1 | THE SYSTEM SHALL proporcionar un formulario modal `ProductFormModal` que se abra al hacer clic en "Agregar +" o en el botón "Editar" de un producto. |
| REQ-ADDPROD2 | WHEN el modal se abra para crear, THE SYSTEM SHALL mostrar el título "Agregar Producto" y botones de "Agregar". |
| REQ-ADDPROD3 | WHEN el modal se abra para editar, THE SYSTEM SHALL mostrar el título "Editar Producto", pre-llenar los campos con los datos del producto y mostrar botones de "Guardar Cambios". |
| REQ-ADDPROD4 | THE SYSTEM SHALL incluir un campo de texto obligatorio para el "Nombre". |
| REQ-ADDPROD5 | THE SYSTEM SHALL mostrar un campo "Código de Barras (opcional)", pero DEBE estar deshabilitado con un indicador visual de "En desarrollo" (la funcionalidad de escáner será de una SPEC futura). |
| REQ-ADDPROD6 | THE SYSTEM SHALL incluir un campo "Precio" obligatorio, utilizando el mismo componente de entrada de moneda (empezando por decimales) que se usa en la creación de planes. |
| REQ-ADDPROD7 | THE SYSTEM SHALL incluir un campo "Stock" que inicie en 1 por defecto. DEBE permitir escritura manual y modificación mediante botones "+" y "-". |
| REQ-ADDPROD8 | THE SYSTEM SHALL incluir una zona para subir "Imagen" (opcional), soportando formatos comunes (JPG, PNG, WEBP). |
| REQ-ADDPROD9 | THE SYSTEM SHALL mostrar un modal de confirmación (`ConfirmModal`) antes de enviar el formulario. |
| REQ-ADDPROD10 | IF el usuario intenta cerrar el modal habiendo hecho cambios no guardados, THEN THE SYSTEM SHALL mostrar un modal de advertencia para evitar pérdida de datos. |
| REQ-ADDPROD11 | UPON envío exitoso, THE SYSTEM SHALL guardar o actualizar los datos en la colección `productos` de PocketBase e invalidar la caché de React Query para refrescar la lista. |

## 4. Diseño y UX
- El diseño debe replicar la imagen de referencia: fondo azul oscuro/negro, tarjetas grises para agrupar campos, y el color amarillo corporativo (#FFC107) para acentos, botones primarios y botones de stock.
- Las validaciones de campos vacíos obligatorios deben mostrar notificaciones toast de error.

## 5. Archivos Afectados
- `src/features/admin-views/inventory/ProductFormModal.tsx` (NUEVO)
- `src/features/admin-views/inventory/ProductsSubView.tsx` (Modificado para importar el modal y conectarlo a los botones).
