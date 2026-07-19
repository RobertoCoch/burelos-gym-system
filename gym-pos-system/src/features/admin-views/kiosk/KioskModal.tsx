import React, { useState, useEffect } from 'react';
import { Maximize, X } from 'lucide-react';
import { getDailyPIN } from '../../../utils/attendance';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KioskModal({ isOpen, onClose }: KioskModalProps) {
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPin = getDailyPIN();

  // Format time (HH:MM:SS)
  const timeString = time.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Format date (Jueves, 18 de Julio)
  const dateString = time.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-[#111827] via-[#1C2031] to-[#0A0D14] font-sans p-6 md:p-10 overflow-hidden">
      
      {/* Botón sutil para cerrar */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 text-white/30 hover:text-white transition-colors p-4 rounded-full hover:bg-white/10 active:scale-95 z-50"
      >
        <X size={36} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-5xl animate-in fade-in zoom-in duration-700 ease-out">
        
        {/* Encabezado */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase drop-shadow-md">
            Registra tu <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Asistencia</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 font-medium tracking-wide mt-4">
            Ingresa este código en tu cuenta de Burelos
          </p>
        </div>

        {/* PIN Principal (Cristal) */}
        <div className="relative w-full flex justify-center group mb-6">
          <div className="absolute inset-0 bg-[#FFC107] blur-[150px] opacity-15 rounded-full scale-125 transition-opacity duration-1000 group-hover:opacity-25"></div>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-12 py-8 md:px-24 md:py-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-700 hover:scale-105">
            <div className="text-[120px] md:text-[200px] leading-none font-black text-white tracking-[0.1em] drop-shadow-[0_0_50px_rgba(255,193,7,0.5)]">
              {currentPin}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Reloj */}
      <div className="flex flex-col items-center gap-1 shrink-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 pb-2">
        <div className="text-white/60 text-2xl md:text-4xl font-light font-mono tracking-widest">
          {timeString}
        </div>
        <h2 className="text-white/40 text-sm md:text-lg font-medium tracking-wide uppercase mt-1">
          {dateString}
        </h2>
      </div>

    </div>
  );
}
