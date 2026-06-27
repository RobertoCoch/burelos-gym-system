# SPEC-001: Gestión de Usuarios

- **ID:** SPEC-001
- **Versión:** 1.1
- **Estado:** Activo
- **Dueño:** Roberto (o equipo de desarrollo)

## 2. Contexto
El sistema del gimnasio necesita tener un registro de los usuarios que interactúan con el sistema. Existen diferentes tipos de usuarios, primordialmente administradores y clientes. Esta feature resuelve la necesidad de dar de alta, editar, listar y controlar el acceso de los usuarios utilizando las funcionalidades nativas de autenticación de PocketBase. Es la base sobre la cual se construye la asignación de planes y rutinas.

## 3. Modelo de datos (PocketBase)

**Colección de Autenticación: `users`**
- `id` (Text, Primary Key, autogenerado de 15 caracteres)
- `username` (Text, Unique)
- `email` (Text, Unique, Email)
- `emailVisibility` (Bool)
- `verified` (Bool)
- `name` (Text)
- `avatar` (File)
- `role` (Select: 'admin', 'client') // Manejo de roles dentro de la colección
- `created` (Autodate)
- `updated` (Autodate)

*Nota: Las contraseñas (password) y tokens son manejados internamente por PocketBase en las colecciones Auth.*

## 4. Requisitos EARS

| Req ID | Requisito |
| --- | --- |
| REQ-U1 | THE SYSTEM SHALL permitir listar, crear, y actualizar (CRUD) usuarios sincronizados con PocketBase. |
| REQ-U2 | WHEN se crea un nuevo usuario, THE SYSTEM SHALL enviarlo al endpoint de PocketBase garantizando que los campos mínimos (email, password, passwordConfirm, name, role) estén presentes. |
| REQ-U3 | IF el email del usuario ya existe en PocketBase, THEN THE SYSTEM SHALL capturar el error de PocketBase (400 Bad Request) y mostrar un error "El correo ya está en uso" en la UI. |
| REQ-U4 | WHERE el usuario a modificar sea un 'admin', THE SYSTEM SHALL requerir permisos equivalentes o superiores para cambiar su rol u otra información crítica. |
| REQ-U5 | WHILE el usuario no tenga rol de 'admin', THE SYSTEM SHALL restringir el acceso a la vista de creación y listado total de usuarios del panel. |

## 5. Lo demás

**Rutas/Vistas (Frontend):**
- `/admin-views/users` - Lista general de usuarios (Dashboard)
- Modal / Formulario de Creación/Edición

**Servicios / PocketBase:**
- `pb.collection('users').getList()` - Para listar usuarios
- `pb.collection('users').create()` - Para registrar
- `pb.collection('users').update()` - Para actualizar datos de perfil

**Roles:**
- **admin:** Tiene control sobre los usuarios y puede asignarse planes o cobrar. Gracias a la regla `manageRule: @request.auth.role = 'admin'` en PocketBase, los administradores pueden ver correos de clientes y gestionar sus contraseñas.
- **client:** Cliente regular, solo tiene acceso a sus propios datos e historial desde su app/vista.

**Fases de Implementación:**
- **Fase 1:** CRUD básico integrado con PocketBase y formulario con roles `admin` y `client`.
- **Fase 2:** Subida de archivo (Avatar) nativa mediante FormData y PocketBase.
- **Fase 3 (Completada):** Panel de detalles de usuario (Slide-over), modo de edición con campos precargados, y controles de lista (buscador en tiempo real, ordenamiento por antigüedad, y filtro por estado). Adaptación de permisos de PocketBase (`manageRule` y `listRule`) para permitir visibilidad completa al administrador.
