# SPEC-013: Sistema de Asistencias mediante PIN Dinámico

- **ID:** SPEC-013
- **Versión:** 1.0
- **Estado:** En planificación
- **Dueño:** Roberto / Equipo de Desarrollo

## 1. Objetivo
Sustituir el registro de asistencia de un solo clic por un sistema validado mediante un PIN diario de 4 dígitos. Esto asegura que el cliente realmente esté presente en el local para registrar su asistencia y permite flexibilidad en caso de problemas de conectividad en recepción.

## 2. Lógica del PIN (Algoritmo Dinámico)
- El PIN será de 4 dígitos.
- Para evitar interacciones innecesarias con la base de datos (crons a medianoche), el PIN se generará "al vuelo" matemáticamente.
- **Fórmula:** `hash( FechaActual (YYYY-MM-DD) + VITE_ATTENDANCE_SECRET ) % 10000`
- Esto asegura que tanto la Mac del administrador como el celular del cliente generen el mismo código exacto el mismo día, cambiando automáticamente a las 12:00 AM.

## 3. Funciones del Administrador (Kiosko)
- En el `AdminLayout` o `Dashboard`, se añadirá un botón para activar el **"Modo Kiosko"**.
- El Modo Kiosko abrirá un modal de pantalla completa oscura (optimizada para la Mac de recepción).
- Mostrará en tipografía ultra-grande el "Código de Asistencia de Hoy" (ej. **4928**).
- El Kiosko se actualizará dinámicamente si se deja abierto de un día para otro.

## 4. Funciones del Cliente (App)
- En la sección `AttendancesSection.tsx`, el botón "Registrar Asistencia" ya no abrirá el cuadro de diálogo estándar de "¿Estás seguro?".
- Ahora abrirá un **PINModal**: un componente elegante con un campo para introducir los 4 dígitos.
- Si el código ingresado coincide con el código matemático del día, se aprueba y se guarda la asistencia en PocketBase.
- Si es incorrecto, el campo se limpia y marca un error visual (borde rojo o sacudida) y un Toast de advertencia.
- Una vez registrada la asistencia, el botón principal se bloquea durante el resto del día para prevenir duplicados.

## 5. Componentes a Modificar / Crear
1. **[NUEVO] `src/utils/attendance.ts`**: Función utilitaria matemática para generar el código.
2. **[MODIFICAR] `.env`**: Agregar variable secreta `VITE_ATTENDANCE_SECRET`.
3. **[NUEVO] `src/features/admin-views/kiosk/KioskModal.tsx`**: Modal gigante para la Mac del mostrador.
4. **[MODIFICAR] `src/layouts/AdminLayout.tsx`**: Botón en la cabecera para abrir el KioskModal.
5. **[NUEVO] `src/features/progress/modals/PinModal.tsx`**: Cuadro de diálogo para que el cliente ingrese los 4 dígitos.
6. **[MODIFICAR] `src/features/progress/components/AttendancesSection.tsx`**: Lógica para invocar el PinModal en lugar de ConfirmModal.
