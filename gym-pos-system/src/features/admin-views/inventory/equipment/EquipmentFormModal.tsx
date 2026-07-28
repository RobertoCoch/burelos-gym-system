import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Minus, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../context/ToastContext';
import pb from '../../../../lib/pocketbase';
import ConfirmModal from '../../../../components/shared/ConfirmModal';
import type { Equipment, EquipmentType, TargetMuscle } from '../../../../types/equipment';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
  onSuccess: () => void;
}

export default function EquipmentFormModal({ isOpen, onClose, equipmentToEdit, onSuccess }: EquipmentFormModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadTotal, setCantidadTotal] = useState<number>(1);
  const [cantidadMantenimiento, setCantidadMantenimiento] = useState<number>(0);
  const [tipo, setTipo] = useState<EquipmentType>('Peso Libre');
  const [musculo, setMusculo] = useState<TargetMuscle>('Full Body');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    action: null as 'close' | 'submit' | null,
    title: '',
    message: '',
    confirmText: 'Continuar'
  });
  
  const resetForm = () => {
    if (equipmentToEdit) {
      setName(equipmentToEdit.nombre || '');
      setDescripcion(equipmentToEdit.descripcion || '');
      setCantidadTotal(equipmentToEdit.cantidad_total ?? 1);
      setCantidadMantenimiento(equipmentToEdit.cantidad_mantenimiento ?? 0);
      setTipo(equipmentToEdit.tipo || 'Peso Libre');
      setMusculo(equipmentToEdit.musculo_objetivo || 'Full Body');
    } else {
      setName('');
      setDescripcion('');
      setCantidadTotal(1);
      setCantidadMantenimiento(0);
      setTipo('Peso Libre');
      setMusculo('Full Body');
    }
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      resetForm();
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
      resetForm();
    }
  }, [isOpen, equipmentToEdit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const checkIfDirty = () => {
    if (equipmentToEdit) {
      return (
        name !== equipmentToEdit.nombre ||
        descripcion !== (equipmentToEdit.descripcion || '') ||
        tipo !== equipmentToEdit.tipo ||
        musculo !== equipmentToEdit.musculo_objetivo ||
        imageFile !== null
      );
    }
    return name !== '' || descripcion !== '' || cantidadTotal !== 1 || cantidadMantenimiento !== 0 || imageFile !== null;
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
    }
  };

  const handleSubmitClick = () => {
    const valName = name.trim();

    if (!valName) {
      toast.error('El nombre del equipo es obligatorio');
      return;
    }
    
    if (cantidadMantenimiento > cantidadTotal) {
      toast.error('El mantenimiento no puede ser mayor al total de equipos');
      return;
    }

    if (equipmentToEdit && !checkIfDirty()) {
      handleClose();
      return;
    }

    setConfirmModalState({
      isOpen: true,
      action: 'submit',
      title: equipmentToEdit ? 'Confirmar actualización' : 'Confirmar registro',
      message: equipmentToEdit ? '¿Desea guardar los cambios del equipo?' : 'Está por registrar un nuevo equipo, ¿Desea continuar?',
      confirmText: equipmentToEdit ? 'Sí, guardar' : 'Sí, registrar'
    });
  };

  const getPrefix = (t: EquipmentType) => {
    switch(t) {
      case 'Peso Libre': return 'PL';
      case 'Máquina Guiada': return 'MG';
      case 'Poleas': return 'PC';
      case 'Cardio': return 'C';
      case 'Funcional': return 'FC';
      default: return 'EQ';
    }
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('nombre', name.trim());
      payload.append('descripcion', descripcion.trim());
      payload.append('tipo', tipo);
      payload.append('musculo_objetivo', musculo);
      
      if (imageFile) {
        payload.append('imagen', imageFile);
      }

      if (equipmentToEdit) {
        // En modo edición ya no actualizamos la cantidad total aquí (se hace desde las unidades)
        await pb.collection('equipo_gym').update(equipmentToEdit.id, payload);
        toast.success('Equipo actualizado exitosamente');
      } else {
        // Modo Creación
        // 1. Calcular código base
        const prefix = getPrefix(tipo);
        const existingEq = await pb.collection('equipo_gym').getFullList({
          filter: `tipo = "${tipo}"`
        });
        
        // Encontrar el número máximo
        let maxNumber = 0;
        existingEq.forEach(eq => {
          if (eq.codigo_base && eq.codigo_base.startsWith(`${prefix}-`)) {
            const num = parseInt(eq.codigo_base.split('-')[1]);
            if (!isNaN(num) && num > maxNumber) {
              maxNumber = num;
            }
          }
        });
        
        const nextNumber = maxNumber + 1;
        const codigoBase = `${prefix}-${nextNumber.toString().padStart(2, '0')}`;
        
        payload.append('codigo_base', codigoBase);
        payload.append('cantidad_total', cantidadTotal.toString());
        payload.append('cantidad_mantenimiento', cantidadMantenimiento.toString());

        const newEq = await pb.collection('equipo_gym').create(payload);
        
        // 2. Crear las unidades
        for (let i = 1; i <= cantidadTotal; i++) {
          const ref = `${codigoBase}-${i.toString().padStart(2, '0')}`;
          const estado = i <= (cantidadTotal - cantidadMantenimiento) ? 'Operativo' : 'Mantenimiento';
          
          await pb.collection('equipo_unidades').create({
            equipo_id: newEq.id,
            codigo_referencia: ref,
            estado: estado
          });
        }

        toast.success('Equipo y unidades agregados exitosamente');
      }
      
      onSuccess();
      handleClose(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Error al guardar el equipo');
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
            {equipmentToEdit ? 'Editar' : 'Agregar'} <br className="sm:hidden" />
            <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Equipo</span>
          </h1>
        </div>

        <div className="w-[40px]"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-6 md:pt-8 w-full max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-6">
        
        <p className="text-sm font-bold text-white/70 px-1">Campos obligatorios *</p>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
          
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Nombre del Equipo *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-[#FFC107] focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
              placeholder="Ej. Barra Olímpica 20 kg"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-medium text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner resize-none min-h-[100px]"
              placeholder="Ej. Ideal para realizar sentadillas libres, peso muerto y preses. Uso recomendado para atletas intermedios/avanzados."
            />
          </div>

          {/* Tipo y Músculo Objetivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Clasificación *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as EquipmentType)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner appearance-none"
              >
                <option value="Peso Libre">Peso Libre</option>
                <option value="Máquina Guiada">Máquina Guiada</option>
                <option value="Poleas">Poleas / Cables</option>
                <option value="Cardio">Cardio</option>
                <option value="Funcional">Funcional / Accesorios</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Músculo Principal *</label>
              <select
                value={musculo}
                onChange={(e) => setMusculo(e.target.value as TargetMuscle)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner appearance-none"
              >
                <option value="Full Body">Full Body (Cardio/Funcional)</option>
                <option value="Pecho">Pecho</option>
                <option value="Espalda">Espalda</option>
                <option value="Pierna">Pierna / Glúteo</option>
                <option value="Brazo">Brazo (Bíceps/Tríceps)</option>
                <option value="Hombro">Hombro</option>
              </select>
            </div>
          </div>

          {/* Cantidades (Solo visibles en creación) */}
          {!equipmentToEdit && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Cantidad de Unidades a Registrar *</label>
              <div className="flex items-center w-full bg-[#1A1F2E] border border-white/5 rounded-2xl p-2 shadow-inner max-w-sm">
                <button 
                  onClick={() => setCantidadTotal(p => p > 1 ? p - 1 : 1)}
                  className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                <input
                  type="number"
                  value={cantidadTotal}
                  onChange={(e) => setCantidadTotal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-transparent text-center text-2xl font-bold text-white focus:outline-none min-w-0"
                />
                <button 
                  onClick={() => setCantidadTotal(p => p + 1)}
                  className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
              <p className="text-xs text-gray-400 px-1 mt-1">
                * Todas las unidades comenzarán con estado "Operativo". Podrás cambiarlas a mantenimiento desde la lista de unidades.
              </p>
            </div>
          )}

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Fotografía del Equipo</label>
            <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-inner">
              
              {/* Preview */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-black/30 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-white/10 p-2 shrink-0">
                {(imageFile || equipmentToEdit?.imagen) ? (
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : pb.files.getURL(equipmentToEdit as any, equipmentToEdit!.imagen)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon size={48} className="text-white/20" />
                )}
              </div>
              
              <div className="flex flex-col items-center sm:items-start flex-1 w-full gap-2">
                <div className="text-center sm:text-left">
                  <p className="font-bold text-white/90 text-sm md:text-base">
                    {imageFile ? imageFile.name : (equipmentToEdit?.imagen ? 'Imagen actual guardada' : 'No hay imagen seleccionada')}
                  </p>
                  <p className="text-xs text-white/40 mt-1">Soporta archivos JPG, PNG, y WEBP</p>
                </div>

                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-6 rounded-xl transition-colors text-sm border border-white/10 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {equipmentToEdit?.imagen || imageFile ? 'Cambiar imagen' : 'Explorar archivos'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Submit Button Area */}
        <div className="mt-2 flex flex-col pb-8">
          <button 
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg cursor-pointer
              ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
            `}
          >
            {isSubmitting 
              ? (equipmentToEdit ? 'Guardando...' : 'Agregando...') 
              : (equipmentToEdit ? 'Guardar Cambios' : 'Agregar Equipo')
            }
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
