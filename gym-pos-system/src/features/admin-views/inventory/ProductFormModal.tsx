import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, ScanLine, Minus, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../context/ToastContext';
import pb from '../../../lib/pocketbase';
import ConfirmModal from '../../../components/shared/ConfirmModal';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: any | null; // El producto si estamos en modo editar
}

export default function ProductFormModal({ isOpen, onClose, productToEdit }: ProductFormModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [priceDigits, setPriceDigits] = useState(''); 
  const [stock, setStock] = useState<number>(1);
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
    if (productToEdit) {
      setName(productToEdit.nombre || '');
      setPriceDigits(Math.round((productToEdit.precio || 0) * 100).toString());
      setStock(productToEdit.stock !== undefined ? productToEdit.stock : 1);
    } else {
      setName('');
      setPriceDigits('');
      setStock(1);
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
  }, [isOpen, productToEdit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const checkIfDirty = () => {
    if (productToEdit) {
      const currentPrice = Math.round((productToEdit.precio || 0) * 100).toString();
      return (
        name !== productToEdit.nombre ||
        (priceDigits !== '' && priceDigits !== currentPrice) ||
        stock !== productToEdit.stock ||
        imageFile !== null
      );
    }
    return name !== '' || priceDigits !== '' || stock !== 1 || imageFile !== null;
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

  // Lógica dinámica de precio
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val === '') {
      setPriceDigits('0');
    } else {
      setPriceDigits(parseInt(val, 10).toString()); // Remove leading zeros
    }
  };

  const formattedPrice = (parseInt(priceDigits || '0', 10) / 100).toFixed(2);

  // Lógica de stock
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      setStock(0);
    } else {
      setStock(val);
    }
  };

  const handleDecrementStock = () => {
    setStock(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleIncrementStock = () => {
    setStock(prev => prev + 1);
  };

  const handleSubmitClick = () => {
    const valName = name.trim();
    const valPrice = parseFloat(formattedPrice);

    if (!valName) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    if (valPrice <= 0) {
      toast.error('El precio debe ser mayor a $0.00');
      return;
    }

    if (productToEdit && !checkIfDirty()) {
      handleClose();
      return;
    }

    setConfirmModalState({
      isOpen: true,
      action: 'submit',
      title: productToEdit ? 'Confirmar actualización' : 'Confirmar registro',
      message: productToEdit ? '¿Desea guardar los cambios del producto?' : 'Está por registrar un producto, ¿Desea continuar?',
      confirmText: productToEdit ? 'Sí, guardar' : 'Sí, registrar'
    });
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const valName = name.trim();
      const valPrice = parseFloat(formattedPrice);
      
      const payload = new FormData();
      payload.append('nombre', valName);
      payload.append('precio', valPrice.toString());
      payload.append('stock', stock.toString());
      
      if (imageFile) {
        payload.append('imagen', imageFile);
      }

      if (productToEdit) {
        await pb.collection('productos').update(productToEdit.id, payload);
        toast.success('Producto actualizado exitosamente');
      } else {
        await pb.collection('productos').create(payload);
        toast.success('Producto agregado exitosamente');
      }
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      handleClose(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Error al guardar el producto');
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
            {productToEdit ? 'Editar' : 'Agregar'} <br className="sm:hidden" />
            <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Producto</span>
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
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-[#FFC107] focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
              placeholder="Ej. Whey Protein 1 kg"
            />
          </div>

          {/* Código de Barras (Deshabilitado / En desarrollo) */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Código de Barras (opcional)</label>
            <div className="relative flex items-center opacity-50 cursor-not-allowed">
              <button 
                disabled
                className="absolute left-2 z-10 bg-[#FFC107] text-black font-bold flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm shadow-md"
              >
                <ScanLine size={16} strokeWidth={2.5} /> Escanear
              </button>
              <input
                disabled
                type="text"
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl pl-[120px] pr-12 py-4 text-[15px] md:text-base font-bold text-white shadow-inner"
              />
              <div className="absolute right-4 text-white/40 font-bold">X</div>
            </div>
            {/* Badge de "En desarrollo" */}
            <div className="absolute -top-1 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20">En desarrollo</div>
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Precio *</label>
            <div className="relative flex items-center w-full md:w-2/3">
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

          {/* Stock */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Stock</label>
            <div className="flex items-center w-full md:w-2/3 bg-[#1A1F2E] border border-white/5 rounded-2xl p-2 shadow-inner">
              <button 
                onClick={handleDecrementStock}
                className="bg-[#FFC107] hover:bg-[#ffca28] text-black w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
              >
                <Minus size={20} strokeWidth={3} />
              </button>
              
              <input
                type="number"
                value={stock}
                onChange={handleStockChange}
                className="flex-1 bg-transparent text-center text-lg font-bold text-white focus:outline-none min-w-0"
              />

              <button 
                onClick={handleIncrementStock}
                className="bg-[#FFC107] hover:bg-[#ffca28] text-black w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Imagen</label>
            <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-inner">
              <ImageIcon size={40} className="text-white/40 mb-1" />
              <p className="font-bold text-white/90 text-sm md:text-base text-center">
                {imageFile ? imageFile.name : (productToEdit?.imagen ? 'Imagen actual guardada' : 'No hay imagen seleccionada')}
              </p>
              <p className="text-xs text-white/40 text-center mb-2">Soporta archivos JPG, PNG, y WEBP</p>
              
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm border border-white/10"
              >
                {productToEdit?.imagen && !imageFile ? 'Cambiar imagen' : 'Explorar archivos'}
              </button>
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
              ? (productToEdit ? 'Guardando...' : 'Agregando...') 
              : (productToEdit ? 'Guardar Cambios' : 'Agregar')
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
