import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPlanModal({ isOpen, onClose }: AddPlanModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [planName, setPlanName] = useState('Plan Basico');
  const [duration, setDuration] = useState('Mensual');
  const [priceDigits, setPriceDigits] = useState('30000'); // stores digits like '30000' for 300.00
  
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
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

  // Price formatting: starts from decimals and grows to integers
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val === '') {
      setPriceDigits('0');
    } else {
      setPriceDigits(parseInt(val, 10).toString()); // Remove leading zeros by parsing
    }
  };

  const formattedPrice = (parseInt(priceDigits || '0', 10) / 100).toFixed(2);

  return (
    <div 
      className={`fixed inset-0 z-[110] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
        ${isMounted && !isClosing ? 'translate-x-0' : isClosing ? '-translate-x-full' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 shrink-0 relative min-h-[60px] md:min-h-[72px] bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <button 
          onClick={handleClose}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            Agregar <br className="sm:hidden" />
            <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Plan</span>
          </h1>
        </div>

        <div className="w-[40px]"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-6 md:pt-8 w-full max-w-2xl lg:max-w-7xl mx-auto flex flex-col lg:flex-row lg:gap-8 lg:items-stretch">
        
        {/* Col 1 */}
        <div className="flex-1 flex flex-col mb-8 lg:mb-0">
          <p className="text-sm font-bold text-white/70 mb-4 lg:mb-6 px-1">Campos obligatorios *</p>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6 flex-1">
            {/* Nombre del plan */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Nombre del plan *</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-[#FFC107] focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                placeholder="Ej. Plan Básico"
              />
            </div>

            {/* Duración */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Duración *</label>
              <div className="relative">
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#FFC107] border border-[#FFC107]/20 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-black focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)] appearance-none cursor-pointer"
                >
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Anual">Anual</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/60 pl-2">
                  <ChevronDown size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Precio *</label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-white/50 font-bold">$</span>
                <input
                  type="text"
                  value={formattedPrice}
                  onChange={handlePriceChange}
                  className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl pl-10 pr-16 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                />
                <span className="absolute right-5 text-white/50 font-bold text-sm">MXN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="flex-1 flex flex-col mb-8 lg:mb-0 lg:pt-[40px] xl:pt-[44px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6 flex-1">
            {/* Beneficios (Rich Editor Placeholder) */}
            <div className="flex flex-col gap-2 h-full">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Beneficios</label>
              {/* Contenedor que simulará el espacio de un Rich Editor en el futuro */}
              <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-4 flex flex-col shadow-inner transition-colors focus-within:border-[#FFC107]/50 group flex-1 min-h-[200px]">
                {/* Toolbar simulada */}
                <div className="flex gap-2 border-b border-white/10 pb-3 mb-3 text-white/40 flex-wrap">
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-xs group-focus-within:text-[#FFC107] transition-colors">B</button>
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center italic text-xs group-focus-within:text-[#FFC107] transition-colors">I</button>
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center underline text-xs group-focus-within:text-[#FFC107] transition-colors">U</button>
                  <div className="w-px h-7 bg-white/10 mx-1 hidden sm:block"></div>
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs group-focus-within:text-[#FFC107] transition-colors">≡</button>
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs group-focus-within:text-[#FFC107] transition-colors">1.</button>
                  <button className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs group-focus-within:text-[#FFC107] transition-colors">•</button>
                </div>
                <textarea 
                  className="w-full bg-transparent text-white/80 text-[15px] md:text-base focus:outline-none resize-none flex-1 placeholder:text-white/30"
                  placeholder="Escribe los beneficios aquí... (herramientas de texto simuladas)"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="lg:w-[220px] shrink-0 flex flex-col justify-end lg:justify-start lg:items-center lg:pt-[40px] xl:pt-[44px]">
          <button 
            onClick={handleClose}
            className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-5 px-6 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg"
          >
            Agregar
          </button>
        </div>

      </div>
    </div>
  );
}
