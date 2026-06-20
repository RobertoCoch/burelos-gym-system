import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Check, X, Search, Scan, Minus, Plus } from 'lucide-react';

interface ProductPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPaymentModal({ isOpen, onClose }: ProductPaymentModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isGuest, setIsGuest] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mock product data based on the image
  const [products, setProducts] = useState([
    { id: 1, name: 'Whey Protein 1KG', price: 300, qty: 1, img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 2, name: 'Agua 600 ml', price: 15, qty: 1, img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=150&h=150' }
  ]);

  const updateQty = (id: number, delta: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  const total = products.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setStep(1); // Reset to step 1 on open
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

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      handleClose();
    }
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
          onClick={handleBack}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        {/* Título centrado absolutamente en la vista */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            {step === 1 ? 'Elige Productos' : 'Datos de Pago'}
          </h1>
        </div>

        {/* Espaciador invisible */}
        <div className="w-[40px]"></div>
      </div>

      {/* Main Content Area - Oculta el overflow horizontal para la transición de los pasos */}
      <div className="flex-1 relative overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* Contenedor Flex para los 2 pasos, con ancho 200% para poder deslizar */}
        <div 
          className="flex w-[200%] h-full transition-transform duration-500 ease-in-out"
          style={{ transform: step === 1 ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          
          {/* ================= STEP 1: ELIGE PRODUCTOS ================= */}
          <div className="w-1/2 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-4 flex flex-col md:flex-row gap-8 md:gap-16">
            
            {/* Izquierda: Buscador y Lista de Productos */}
            <div className="flex flex-col gap-6 flex-1">
              
              {/* Barra de Busqueda y Escanear */}
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-white/40" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent border border-white/20 rounded-xl pl-11 pr-4 py-3 text-[15px] font-medium text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors"
                    placeholder="Buscar producto..."
                  />
                </div>
                <button className="bg-[#FFC107] hover:bg-[#FFD54F] text-black rounded-xl px-4 py-3 flex items-center gap-2 transition-all active:scale-95 font-bold text-sm shadow-[0_0_15px_rgba(255,193,7,0.3)]">
                  <Scan size={18} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Escanear</span>
                </button>
              </div>

              {/* Lista de Productos */}
              <div className="flex flex-col gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="w-[70px] h-[70px] bg-white rounded-xl overflow-hidden shrink-0">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <span className="text-[#FFC107] font-bold text-base md:text-lg leading-tight w-2/3">{product.name}</span>
                        <span className="text-white font-extrabold text-lg">${product.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <button 
                          onClick={() => updateQty(product.id, -1)}
                          className="w-8 h-8 rounded-lg bg-[#FFC107] text-black flex items-center justify-center transition-all active:scale-95 hover:bg-[#FFD54F]"
                        >
                          <Minus size={18} strokeWidth={3} />
                        </button>
                        <span className="text-white font-bold text-lg w-4 text-center">{product.qty}</span>
                        <button 
                          onClick={() => updateQty(product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#FFC107] text-black flex items-center justify-center transition-all active:scale-95 hover:bg-[#FFD54F]"
                        >
                          <Plus size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Derecha: Total & Siguiente */}
            <div className="flex flex-col w-full md:w-[350px] lg:w-[400px] shrink-0 mt-4 md:mt-0">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-8 sticky top-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xl font-bold text-white/90">Total:</span>
                </div>
                
                <div className="flex items-baseline justify-center gap-2 py-4 border-y border-white/5">
                  <span className="text-5xl font-extrabold text-white">${total.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">MXN</span>
                </div>
                
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-5 px-6 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg mt-2"
                >
                  Siguiente
                </button>
              </div>
            </div>

          </div>


          {/* ================= STEP 2: DATOS DE PAGO ================= */}
          <div className="w-1/2 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-4 flex flex-col md:flex-row gap-8 md:gap-16">
            
            {/* Columna Izquierda - Datos y Metodo de pago */}
            <div className="flex flex-col gap-8 flex-1">
              
              {/* Section: Datos */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
                
                {/* Usuario Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[13px] md:text-sm font-bold text-[#FFC107]">Usuario</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isGuest ? 'border-[#white] bg-white/20' : 'border-white/30 group-hover:border-white/50'}`}>
                        {isGuest && <div className="w-2 h-2 rounded-full bg-white" />}
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
                      className={`w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none transition-colors shadow-inner`}
                      placeholder="Buscar usuario..."
                    />
                    {!isGuest && (
                      <button className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 bg-transparent transition-colors">
                        <X size={18} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fecha Input */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[13px] md:text-sm font-bold text-[#FFC107] px-1">Fecha</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="6/06/2026"
                      className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none transition-colors shadow-inner"
                      readOnly
                    />
                    <button className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Metodo de Pago */}
                <div className="flex flex-col gap-3 mt-4">
                  <label className="text-[13px] md:text-sm font-bold text-[#FFC107] px-1">Metodo de Pago</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`py-3 px-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 border flex-1 md:flex-none ${paymentMethod === 'efectivo' ? 'bg-[#1A1F2E] border-white/10 text-white shadow-inner' : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'}`}
                    >
                      Efectivo
                      {paymentMethod === 'efectivo' && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`py-3 px-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 border flex-1 md:flex-none ${paymentMethod === 'transferencia' ? 'bg-[#1A1F2E] border-white/10 text-white shadow-inner' : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/70'}`}
                    >
                      Transferencia
                      {paymentMethod === 'transferencia' && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Columna Derecha - Total & Registrar */}
            <div className="flex flex-col w-full md:w-[350px] lg:w-[400px] shrink-0">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-8 sticky top-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xl font-bold text-white/90">Total:</span>
                </div>
                
                <div className="flex items-baseline justify-center gap-2 py-4 border-y border-white/5">
                  <span className="text-5xl font-extrabold text-white">${total.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">MXN</span>
                </div>
                
                <button 
                  onClick={handleClose}
                  className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-5 px-6 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg mt-2"
                >
                  Registrar
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
