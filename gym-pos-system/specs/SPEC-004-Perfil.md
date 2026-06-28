# SPEC-004: Perfil de Usuario y Header

- **ID:** SPEC-004
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Personalizar la barra superior (Header) para reflejar los datos del usuario real que ha iniciado sesión, reutilizar el panel lateral de detalles de usuario para que funcione como el perfil personal (Tú) y agregar una etiqueta estática de la versión de la aplicación ("Beta 1.0").

## 2. Contexto
Actualmente, el sistema muestra el texto "Administrador" de forma estática en la barra superior. Es necesario que se muestre el nombre del usuario autenticado para darle un toque más personalizado. Además, el botón de "Cerrar sesión" en la cabecera ocupa espacio que puede ser reemplazado por un distintivo de la versión ("Beta 1.0"). La función de cerrar sesión y la visualización de datos personales se unificarán en un panel de perfil que se despliega desde el lado izquierdo.

## 3. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-PER1 | THE SYSTEM SHALL mostrar el nombre real del usuario autenticado en el Header en lugar de "Administrador". |
| REQ-PER2 | WHEN el usuario hace clic sobre su foto/nombre en el Header, THE SYSTEM SHALL desplegar el modal de detalles de usuario (UserDetailsPanel) desde el lado **izquierdo** de la pantalla. |
| REQ-PER3 | IF el modal de detalles corresponde al usuario logueado actualmente, THEN THE SYSTEM SHALL mostrar la etiqueta "Tú" en lugar de "Administrador" o "Cliente". |
| REQ-PER4 | THE SYSTEM SHALL incluir el botón de "Cerrar sesión" dentro del modal de detalles de usuario. |
| REQ-PER5 | THE SYSTEM SHALL mostrar una etiqueta "Beta 1.0" en color gris en el Header, en la posición original del botón de cerrar sesión. |

## 4. Implementación (Lo demás)

**Archivos afectados:**
- `src/components/layout/Header.tsx`:
  - Se obtendrá la información del modelo autenticado mediante `pb.authStore.model`.
  - Se añadirá un estado local para abrir el panel lateral izquierdo.
  - Se reemplazará el botón de cierre de sesión por la etiqueta estática "Beta 1.0".
  
- `src/features/admin-views/users/UserDetailsPanel.tsx`:
  - Se modificarán las propiedades del componente para aceptar nuevas directivas de alineación (derecha por defecto, izquierda para el perfil).
  - Se añadirá lógica para identificar si el `userId` cargado pertenece a `pb.authStore.model?.id`. De ser así, se renderizará el tag "Tú".
  - Se añadirá el diseño y la funcionalidad del botón "Cerrar sesión" en la parte inferior del panel.
