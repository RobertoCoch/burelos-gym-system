# SPEC-004: Perfil de Usuario y Header

- **ID:** SPEC-004
- **Versión:** 1.0
- **Estado:** Completado
- **Dueño:** Roberto (o equipo de desarrollo)

## 1. Objetivo
Personalizar la barra superior (Header) de toda la aplicación (tanto para Administradores como para Clientes) para reflejar los datos del usuario real que ha iniciado sesión. Además, se reutiliza el panel lateral de detalles de usuario para que funcione como el perfil personal (Tú) y agregar una etiqueta estática de la versión de la aplicación ("Beta 1.0").

## 2. Contexto
Inicialmente, el sistema mostraba el texto "Administrador" de forma estática en la barra superior. Se requería que se mostrara el nombre del usuario autenticado para un toque más personalizado en todas las vistas de la app (Admin y Cliente). Además, la función de cerrar sesión y la visualización de datos personales se unifican en un panel de perfil (UserDetailsPanel) que se despliega desde el lado izquierdo al hacer clic en el nombre del usuario en el Header.

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
- `src/layouts/AdminLayout.tsx` y `src/layouts/ClientLayout.tsx`:
  - Se obtiene la información del modelo autenticado mediante `pb.authStore.model`.
  - Se añade un estado local para abrir el panel lateral izquierdo (`UserDetailsPanel`).
  - Se reemplaza el botón de cierre de sesión por la etiqueta estática "Beta 1.0".
  
- `src/features/admin-views/users/UserDetailsPanel.tsx`:
  - Se modificarán las propiedades del componente para aceptar nuevas directivas de alineación (derecha por defecto, izquierda para el perfil).
  - Se añadirá lógica para identificar si el `userId` cargado pertenece a `pb.authStore.model?.id`. De ser así, se renderizará el tag "Tú".
  - Se añadirá el diseño y la funcionalidad del botón "Cerrar sesión" en la parte inferior del panel.
