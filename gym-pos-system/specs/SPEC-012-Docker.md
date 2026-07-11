# SPEC-012: Contenerización con Docker

- **ID:** SPEC-012
- **Versión:** 1.0
- **Estado:** En planificación
- **Dueño:** Roberto / Equipo de Desarrollo

## 1. Objetivo
Unificar y estandarizar el entorno de desarrollo y producción utilizando Docker. Esto garantizará que la aplicación (Vite + React) y la base de datos (PocketBase) se ejecuten en un ecosistema aislado, idéntico en cualquier máquina o servidor.

## 2. Componentes a Contenerizar
1. **Frontend (React/Vite):** Utilizando una imagen de Node.js para instalar dependencias y levantar el servidor.
2. **Backend (PocketBase):** Utilizando una imagen ligera (Alpine Linux) para ejecutar el binario oficial de PocketBase.

## 3. Requisitos EARS
| Req ID | Requisito |
| --- | --- |
| REQ-DOCK1 | THE SYSTEM SHALL proporcionar un `Dockerfile` optimizado para el frontend. |
| REQ-DOCK2 | THE SYSTEM SHALL proporcionar un `Dockerfile` dedicado para el backend de PocketBase. |
| REQ-DOCK3 | THE SYSTEM SHALL utilizar `docker-compose.yml` para orquestar ambos contenedores bajo una misma red, levantando todo con un solo comando. |
| REQ-DOCK4 | THE SYSTEM SHALL configurar volúmenes persistentes para el directorio `pb_data` de PocketBase, evitando la pérdida de información de la BD al apagar los contenedores. |

## 4. Archivos Afectados / Nuevos
- `Dockerfile` (En la raíz del proyecto para Vite)
- `pb/Dockerfile` (Nuevo directorio y archivo para PocketBase)
- `docker-compose.yml` (Orquestador principal en la raíz)
- `.dockerignore` (Para omitir node_modules y mejorar la velocidad de construcción)
