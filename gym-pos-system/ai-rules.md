# Reglas e Instrucciones para la IA (System Prompt / Custom Instructions)

Este archivo sirve como contrato o conjunto de reglas que la IA debe leer al iniciar una sesión de trabajo para entender el contexto del proyecto, las metodologías adoptadas y las convenciones de código.

## 1. Stack Tecnológico General
- **Frontend:** React, TypeScript, TailwindCSS (o el CSS usado), Vite. Arquitectura basada en "Features" (Feature-Sliced Design simplificado) dentro de `src/features/`.
- **Backend / Base de Datos:** **PocketBase**. Todos los modelos de datos en los SPECs hacen referencia directa a colecciones y tipos de campos de PocketBase (text, number, select, editor, autodate, file, relation, etc.). Las consultas y mutaciones se realizan usando el SDK de PocketBase o endpoints correspondientes.

## 2. Metodología de Trabajo: SPECs
- **Antes de escribir código para una nueva feature:** Se debe escribir y revisar el documento SPEC correspondiente en la carpeta `specs/`.
- **Estructura obligatoria de los SPECs:**
  1. Encabezado (ID, versión, estado, dueño)
  2. Contexto (El por qué)
  3. Modelo de datos (Colecciones de PocketBase, campos, tipos, relaciones)
  4. Requisitos EARS (THE SYSTEM SHALL, WHILE, WHEN, WHERE, IF THEN)
  5. Lo demás (Endpoints/Rutas, Roles, Fases)
- **Implementación:** El código debe alinearse estrictamente a los requerimientos EARS definidos en el SPEC.

## 3. Convenciones de Código y Diseño
- **Estilos:** Priorizar la consistencia visual, usar temas modernos (sombras sutiles, bordes redondeados, paletas profesionales).
- **Idioma:** Código en inglés (variables, funciones, componentes), pero la interfaz (textos, modales, alertas) y documentación (SPECs) en Español.

## 4. Reglas de Modificación
- **Evitar suposiciones:** Si un requerimiento es ambiguo, preguntar antes de implementarlo o consultar el SPEC.
- **Mantener la limpieza:** No dejar comentarios innecesarios o código comentado al finalizar una feature.
- **Seguridad:** Asegurarse de respetar los roles de usuario al crear nuevas interfaces o consumir datos de PocketBase.
