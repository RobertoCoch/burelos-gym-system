# SPEC-010: Cambio de Contraseña Seguro

- **ID:** SPEC-010
- **Versión:** 1.0
- **Estado:** En planificación
- **Dueño:** Roberto / Equipo de Desarrollo

## 1. Objetivo
Proveer un mecanismo seguro e independiente para que los usuarios (tanto administradores como clientes) puedan cambiar su contraseña. Esto se realizará solicitando la contraseña actual antes de permitir actualizarla por una nueva, a través de un nuevo modal dedicado.

## 2. Contexto
Anteriormente, el campo de contraseña vivía dentro de `UserFormModal.tsx`. Por razones de seguridad (evitando que los clientes cambien la contraseña sin validación previa y aislando responsabilidades), el campo de contraseña se ocultó para los clientes. Ahora se requiere un flujo donde desde los "Detalles del Usuario" (`UserDetailsPanel.tsx`) se puedan lanzar dos acciones claras: "Modificar información" y "Cambiar contraseña".

## 3. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-PWD1 | THE SYSTEM SHALL proporcionar un componente modal `ChangePasswordModal.tsx` con el mismo estilo visual (glassmorphism) que `UserFormModal`. |
| REQ-PWD2 | THE SYSTEM SHALL solicitar "Contraseña actual", "Nueva contraseña" y "Confirmar nueva contraseña" (para evitar errores tipográficos) dentro del modal. |
| REQ-PWD3 | WHEN el usuario intente guardar, THE SYSTEM SHALL verificar con PocketBase la validez de la contraseña actual antes de aplicar el cambio. |
| REQ-PWD4 | THE SYSTEM SHALL reubicar el botón de editar información en `UserDetailsPanel.tsx` para que se posicione debajo del correo electrónico del usuario. |
| REQ-PWD5 | THE SYSTEM SHALL colocar un botón de "Cambiar contraseña" al mismo nivel (lado a lado o agrupado) del botón de modificar información. |

## 4. Diseño y UX
- **Modal:** Mantendrá el fondo `#0f172a`, inputs oscuros con bordes sutiles y estado "focus" en amarillo (`#FFC107`).
- **Botones en el Panel (`UserDetailsPanel`):** Se usarán botones estilo píldora (`rounded-xl`) con iconos (Lápiz para editar, Llave o Candado para contraseña) que no abarquen tanto espacio pero destaquen visualmente debajo del correo.
- **Manejo de Errores:** Se usarán notificaciones `toast` para avisar si la contraseña actual es incorrecta o si la nueva es muy corta.

## 5. Archivos Afectados
- `src/features/admin-views/users/ChangePasswordModal.tsx` (Nuevo Archivo).
- `src/features/admin-views/users/UserDetailsPanel.tsx` (Reubicación de botones e importación del nuevo modal).
- `src/layouts/AdminLayout.tsx` y `src/layouts/ClientLayout.tsx` (Pasar estado de abrir modal de contraseña al panel, o bien manejar el estado internamente en el Panel).
