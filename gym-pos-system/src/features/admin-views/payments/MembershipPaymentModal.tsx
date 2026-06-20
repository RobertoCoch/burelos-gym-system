import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Check, X } from 'lucide-react';

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MembershipPaymentModal({ isOpen, onClose }: MembershipPaymentModalProps) {
  const [isGuest, setIsGuest] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Usamos un pequeño retraso para permitir que el navegador renderice el estado inicial fuera de la pantalla
      // y luego dispare la transición hacia translate-x-0
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
        ${isMounted && !isClosing ? 'translate-x-0' : isClosing ? '-translate-x-full' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 shrink-0 relative min-h-[60px] md:min-h-[72px] bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg">
        
        {/* Flecha de regreso en la esquina superior izquierda */}
        <button 
          onClick={handleClose}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        {/* Título centrado absolutamente en la vista */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            Pago de <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Membresia</span>
          </h1>
        </div>

        {/* Espaciador invisible para mantener el balance del flex si es necesario */}
        <div className="w-[40px]"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-4 md:pt-8 flex flex-col md:flex-row gap-8 md:gap-16 w-full max-w-7xl mx-auto">
        
        {/* Columna Izquierda - Datos y Metodo de pago */}
        <div className="flex flex-col gap-8 flex-1">
          
          {/* Section: Datos */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base md:text-lg font-bold tracking-tight text-white/90 px-1">Datos</h2>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
              
              {/* Usuario Input */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[13px] md:text-sm font-bold text-white/90">Usuario</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isGuest ? 'border-[#FFC107] bg-[#FFC107]/20' : 'border-white/30 group-hover:border-white/50'}`}>
                      {isGuest && <div className="w-2 h-2 rounded-full bg-[#FFC107]" />}
                    </div>
                    <span className="text-[12px] md:text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">Invitado</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isGuest} 
                      onChange={() => setIsGuest(!isGuest)} 
                    />
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled={isGuest}
                    value={isGuest ? 'Invitado' : 'Roberto Contreras'}
                    readOnly
                    className={`w-full bg-[#1A1F2E] border ${isGuest ? 'border-white/5 text-white/50' : 'border-white/5 text-[#FFC107]'} rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner`}
                    placeholder="Buscar usuario..."
                  />
                  {!isGuest && (
                    <button className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 bg-transparent transition-colors">
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Plan Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Plan *</label>
                <div className="relative">
                  <input
                    type="text"
                    value="Mensual Basico"
                    readOnly
                    className="w-full bg-[#FFC107] border border-[#FFC107]/20 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-black focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                    placeholder="Buscar plan..."
                  />
                  <button className="absolute right-5 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors">
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Fecha Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Fecha</label>
                <div className="relative">
                  <input
                    type="text"
                    value="6/06/2026"
                    className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-[#FFC107] focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                    readOnly
                  />
                  <button className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Metodo de Pago */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base md:text-lg font-bold tracking-tight text-white/90 px-1">Método de Pago</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setPaymentMethod('efectivo')}
                className={`py-3 px-6 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 border flex-1 md:flex-none ${paymentMethod === 'efectivo' ? 'bg-white/10 border-white/10 text-white shadow-lg' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'}`}
              >
                Efectivo
                {paymentMethod === 'efectivo' && <Check size={16} className="text-white" strokeWidth={3} />}
              </button>
              <button 
                onClick={() => setPaymentMethod('transferencia')}
                className={`py-3 px-6 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 border flex-1 md:flex-none ${paymentMethod === 'transferencia' ? 'bg-white/10 border-white/10 text-white shadow-lg' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'}`}
              >
                Transferencia
                {paymentMethod === 'transferencia' && <Check size={16} className="text-white" strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Total & Registrar */}
        <div className="flex flex-col w-full md:w-[350px] lg:w-[400px] shrink-0 md:mt-[44px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-8 sticky top-8">
            <div className="flex justify-between items-center px-1">
              <span className="text-xl font-bold text-white/90">Total a Pagar</span>
            </div>
            
            <div className="flex items-baseline justify-center gap-2 py-4 border-y border-white/5">
              <span className="text-5xl font-extrabold text-white">$300</span>
              <span className="text-2xl font-bold text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">MXN</span>
            </div>
            
            <button 
              onClick={handleClose}
              className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-5 px-6 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg mt-2"
            >
              Registrar Pago
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
