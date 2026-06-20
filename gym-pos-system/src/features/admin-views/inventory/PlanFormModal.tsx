import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, Bold, Italic, Underline } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../context/ToastContext';
import pb from '../../../lib/pocketbase';
import ConfirmModal from '../../../components/shared/ConfirmModal';

import type { Plan } from './api/planes.services';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: Plan | null;
}

export default function PlanFormModal({ isOpen, onClose, planToEdit }: PlanFormModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState('mensual');
  const [priceDigits, setPriceDigits] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    action: null as 'close' | 'submit' | null,
    title: '',
    message: '',
    confirmText: 'Continuar'
  });
  
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  
  const editorRef = useRef<HTMLDivElement>(null);
  
  const resetForm = () => {
    setPlanName('');
    setDuration('mensual');
    setPriceDigits('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      if (planToEdit) {
        setPlanName(planToEdit.nombre);
        setDuration(planToEdit.tipo_duracion);
        setPriceDigits(Math.round(planToEdit.precio * 100).toString());
        if (editorRef.current) {
          editorRef.current.innerHTML = planToEdit.beneficios;
        }
      } else {
        resetForm();
      }
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
      resetForm();
    }
  }, [isOpen, planToEdit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const checkIfDirty = () => {
    if (planToEdit) {
      const currentPrice = Math.round((planToEdit.precio || 0) * 100).toString();
      return (
        planName.trim() !== planToEdit.nombre ||
        duration !== planToEdit.tipo_duracion ||
        (priceDigits !== '' && priceDigits !== currentPrice) ||
        (editorRef.current?.innerHTML || '') !== planToEdit.beneficios
      );
    }
    return planName !== '' || priceDigits !== '' || (editorRef.current?.innerHTML || '') !== '';
  };

  const handleCloseRequest = () => {
    if (checkIfDirty()) {
      setConfirmModalState({
        isOpen: true,
        action: 'close',
        title: '¿Desea salir?',
        message: 'Perderá los datos no guardados.',
        confirmText: 'Sí, salir'
      });
    } else {
      handleClose();
    }
  };

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

  const handleSubmitClick = () => {
    const valName = planName.trim();
    const valPrice = parseFloat(formattedPrice);

    if (!valName) {
      toast.error('El nombre del plan es obligatorio');
      return;
    }
    if (valPrice <= 0) {
      toast.error('El precio debe ser mayor a $0.00');
      return;
    }

    if (planToEdit && !checkIfDirty()) {
      handleClose();
      return;
    }

    setConfirmModalState({
      isOpen: true,
      action: 'submit',
      title: planToEdit ? '¿Desea guardar cambios?' : 'Confirmar registro',
      message: planToEdit ? 'Se actualizará la información del plan.' : 'Está por registrar un plan, ¿Desea continuar?',
      confirmText: planToEdit ? 'Sí, guardar' : 'Sí, registrar'
    });
  };

  const executeSubmit = async () => {
    const valName = planName.trim();
    const valPrice = parseFloat(formattedPrice);
    const valBeneficios = editorRef.current?.innerHTML || '';

    setIsSubmitting(true);
    try {
      const data = {
        nombre: valName,
        tipo_duracion: duration,
        precio: valPrice,
        beneficios: valBeneficios
      };

      if (planToEdit) {
        await pb.collection('planes').update(planToEdit.id, data);
        toast.success('Plan actualizado exitosamente');
      } else {
        await pb.collection('planes').create({ ...data, activo: true });
        toast.success('Plan guardado exitosamente');
      }
      
      // Invalidar cache para que PlansSubView se recargue automáticamente
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      
      handleClose(); // Cerrar modal, la vista padre podría necesitar refrescar los datos.
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Error al guardar el plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmAction = () => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
    if (confirmModalState.action === 'close') {
      handleClose();
    } else if (confirmModalState.action === 'submit') {
      executeSubmit();
    }
  };

  const updateFormatState = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    updateFormatState();
  };

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
        ${isMounted && !isClosing ? 'translate-x-0' : isClosing ? '-translate-x-full' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 shrink-0 relative min-h-[60px] md:min-h-[72px] bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <button 
          onClick={handleCloseRequest}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10 cursor-pointer"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            {planToEdit ? 'Editar' : 'Agregar'} <br className="sm:hidden" />
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
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
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
            {/* Beneficios (Rich Editor) */}
            <div className="flex flex-col gap-2 h-full">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Beneficios</label>
              <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-4 flex flex-col shadow-inner transition-colors focus-within:border-[#FFC107]/50 group flex-1 min-h-[200px]">
                {/* Toolbar */}
                <div className="flex gap-2 border-b border-white/10 pb-3 mb-3 text-white/60 flex-wrap">
                  <button onPointerDown={(e) => { e.preventDefault(); execCmd('bold'); }} className={`cursor-pointer w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-colors ${activeFormats.bold ? 'bg-white/20 text-[#FFC107]' : 'bg-white/5 hover:bg-white/10'}`}><Bold size={14}/></button>
                  <button onPointerDown={(e) => { e.preventDefault(); execCmd('italic'); }} className={`cursor-pointer w-7 h-7 rounded flex items-center justify-center italic text-xs transition-colors ${activeFormats.italic ? 'bg-white/20 text-[#FFC107]' : 'bg-white/5 hover:bg-white/10'}`}><Italic size={14}/></button>
                  <button onPointerDown={(e) => { e.preventDefault(); execCmd('underline'); }} className={`cursor-pointer w-7 h-7 rounded flex items-center justify-center underline text-xs transition-colors ${activeFormats.underline ? 'bg-white/20 text-[#FFC107]' : 'bg-white/5 hover:bg-white/10'}`}><Underline size={14}/></button>
                </div>
                {/* Editable Content */}
                <div 
                  ref={editorRef}
                  contentEditable
                  onKeyUp={updateFormatState}
                  onMouseUp={updateFormatState}
                  onFocus={updateFormatState}
                  className="w-full bg-transparent text-white/80 text-[15px] md:text-base focus:outline-none resize-none flex-1 pb-4 cursor-text prose prose-invert prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-[#FFC107] prose-strong:font-extrabold prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5 max-w-none"
                  style={{ minHeight: '150px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="lg:w-[220px] shrink-0 flex flex-col justify-end lg:justify-start lg:items-center lg:pt-[40px] xl:pt-[44px]">
          <button 
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`w-full font-extrabold py-5 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg cursor-pointer
              ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
            `}
          >
            {isSubmitting ? 'Guardando...' : (planToEdit ? 'Guardar cambios' : 'Agregar')}
          </button>
        </div>

      </div>

      <ConfirmModal 
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
