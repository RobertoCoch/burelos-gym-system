import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import pb from '../../../lib/pocketbase';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightModal({ isOpen, onClose, onSaved }: WeightModalProps & { onSaved?: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch last recorded height if available
  useEffect(() => {
    const fetchLastRecord = async () => {
      try {
        const userId = pb.authStore.model?.id;
        if (!userId) return;
        
        const records = await pb.collection('progreso_fisico').getList(1, 1, {
          filter: `usuario = "${userId}"`,
          sort: '-created'
        });
        
        if (records.items.length > 0) {
          setEstatura(records.items[0].estatura?.toString() || '');
        }
      } catch (error) {
        console.error('Error fetching last record:', error);
      }
    };
    
    if (isOpen) {
      fetchLastRecord();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setPeso('');
      setEstatura('');
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

  const handleSubmit = async () => {
    if (!peso || !estatura) {
      toast.error('Por favor ingresa ambos valores');
      return;
    }
    
    const userId = pb.authStore.model?.id;
    if (!userId) {
      toast.error('No se encontró sesión activa');
      return;
    }

    setIsSubmitting(true);
    try {
      await pb.collection('progreso_fisico').create({
        usuario: userId,
        peso: parseFloat(peso),
        estatura: parseFloat(estatura)
      });
      
      toast.success('Registro guardado exitosamente');
      if (onSaved) onSaved();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al guardar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
        ${isMounted && !isClosing ? 'translate-x-0' : isClosing ? '-translate-x-full' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 shrink-0 relative min-h-[60px] md:min-h-[72px] bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <button 
          onClick={handleClose}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10 cursor-pointer"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            Registrar <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Medidas</span>
          </h1>
        </div>

        <div className="w-[40px]"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-6 md:pt-8 w-full max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-6">
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6 items-center">
          
          <div className="bg-[#1A1F2E] p-4 rounded-full border border-white/10 mb-2">
            <Scale size={32} className="text-[#FFC107]" />
          </div>
          <p className="text-white/60 text-center font-medium mb-2">
            Ingresa tu peso y estatura para mantener un registro histórico y calcular tu IMC.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                placeholder="Ej. 75.5"
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Estatura (metros) *</label>
              <input
                type="number"
                step="0.01"
                value={estatura}
                onChange={(e) => setEstatura(e.target.value)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                placeholder="Ej. 1.75"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 flex flex-col pb-8">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg cursor-pointer
              ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
            `}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Progreso'}
          </button>
        </div>

      </div>
    </div>
  );
}
