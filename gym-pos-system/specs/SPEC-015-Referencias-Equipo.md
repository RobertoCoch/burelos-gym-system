# SPEC-015: Referencias de Equipo y Códigos QR

## Objetivo
Establecer un sistema de codificación único y escalable para identificar cada aparato o equipo dentro del gimnasio. Esto permitirá generar códigos QR individuales por máquina, facilitando su identificación por parte de los clientes y mejorando el control de mantenimiento por parte de los administradores.

## 1. Sistema de Nomenclatura (Códigos de Referencia)
Cada equipo registrado generará automáticamente sus códigos de referencia basándose en su clasificación, su orden de registro y su cantidad de unidades.

### 1.1. Prefijos por Tipo de Equipo
El código iniciará con iniciales según la clasificación (Campo `tipo`):
- **PL** - Peso Libre
- **MG** - Máquina Guiada
- **PC** - Poleas o Cables
- **C** - Cardio
- **FC** - Funcional / Accesorios

### 1.2. Estructura del Código
El formato completo será: `[PREFIJO]-[ID_MODELO]-[ID_UNIDAD]`

**Ejemplo de creación:**
1. Se registra una *Prensa de Piernas* (Máquina Guiada). Al ser el primer modelo de máquina guiada en la base de datos, adquiere el ID de modelo `01`.
   - **Referencia Base:** `MG-01`
2. Si el gimnasio adquirió 2 prensas iguales, cada unidad recibe su identificador final:
   - **Unidad 1:** `MG-01-01`
   - **Unidad 2:** `MG-01-02`

## 2. Generación de Códigos QR
- El sistema deberá generar un Código QR único por cada unidad específica (Ej. un QR para `MG-01-01` y otro para `MG-01-02`).
- El valor interno del código QR puede ser una URL de la aplicación o el ID directo de la unidad en la base de datos, lo que permitirá en un futuro (SPEC-016 Rutinas) escanear la máquina y ver cómo se usa.
- La librería propuesta para generar el QR de forma visual en React es `qrcode.react`.

## 3. Experiencia de Usuario (UI)
El reto de diseño consiste en no saturar la vista de tarjetas actual (`EquipmentCard`) si se tienen, por ejemplo, 10 mancuernas iguales.

**Propuesta de Interfaz:**
1. **La tarjeta principal de equipo no cambia radicalmente.** Sigue mostrando la suma global (ej. "Disponibles: 10 equipos").
2. **Botón "Ver Unidades / QR":** Se agregará un botón o pestaña dentro del menú (3 puntos) o al expandir la tarjeta, que despliegue una "Mini Tabla" o "Carrusel" mostrando las unidades individuales (ej. `PL-05-01` a `PL-05-10`).
3. **Mantenimiento Individual:** En este desglose, el administrador podrá marcar como "En mantenimiento" una unidad específica (ej. `MG-01-02`), lo que automáticamente restará 1 a los "Disponibles" generales, afectando la lógica de forma precisa en lugar de depender de un número manual.
4. **Impresión de QR:** Junto a cada unidad, existirá un botón de "Imprimir QR" para obtener un diseño listo para pegar en la máquina física.

## 4. Reestructuración de Base de Datos
Para lograr esta precisión, se requiere una actualización en la arquitectura de datos:
- Modificar el comportamiento de `cantidad_total` y `cantidad_mantenimiento` de la colección `equipo_gym`. Ya no serán campos numéricos editables manualmente, sino campos *calculados*.
- Crear una nueva colección en PocketBase llamada **`equipo_unidades`**:
  - `equipo_id` (Relación a `equipo_gym`)
  - `codigo_referencia` (Ej. "MG-01-01")
  - `estado` ("Operativo" o "Mantenimiento")
  - `qr_data` (Datos del QR)
