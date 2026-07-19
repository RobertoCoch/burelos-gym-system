/**
 * attendance.ts
 * Utilidades para el manejo de asistencias mediante PIN dinámico matemático.
 */

/**
 * Genera un PIN matemático de 4 dígitos basado en la fecha actual y una palabra secreta.
 * Este PIN cambia a la medianoche (12:00 AM) automáticamente.
 * 
 * @returns string de 4 dígitos (ej: "0492")
 */
export function getDailyPIN(): string {
  // Obtenemos la fecha local actual
  const now = new Date();
  // Formateamos la fecha (ej: "2026-7-18")
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  
  // Obtenemos la palabra secreta de las variables de entorno, con un fallback de seguridad.
  const secret = import.meta.env.VITE_ATTENDANCE_SECRET || 'DefaultSecretGym2026';
  
  const combined = dateStr + secret;
  
  // Creamos un hash ligero (DJB2 variant)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Nos aseguramos que sea positivo y limitamos a 10,000 (4 dígitos)
  const rawPin = Math.abs(hash) % 10000;
  
  // Rellenamos con ceros a la izquierda si es necesario (ej: "45" -> "0045")
  return rawPin.toString().padStart(4, '0');
}
