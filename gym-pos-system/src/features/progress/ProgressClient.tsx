import React from 'react';

export default function ProgressClient() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center font-sans text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)] mb-4">Mi Progreso</h1>
      <p className="text-white/60 font-medium">Revisa tu avance y estadísticas.</p>
    </div>
  );
}
