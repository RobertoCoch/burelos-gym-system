import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import pb from '../../../lib/pocketbase';
import ConfirmModal from '../../../components/shared/ConfirmModal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ChangePasswordModal({ isOpen, onClose, userId }: ChangePasswordModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    action: null as 'close' | 'submit' | null,
    title: '',
    message: '',
    confirmText: 'Continuar'
  });

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const checkIfDirty = () => {
    return oldPassword.trim() !== '' || newPassword.trim() !== '' || confirmPassword.trim() !== '';
  };

  const handleCloseRequest = () => {
    if (checkIfDirty()) {
      setConfirmModalState({
        isOpen: true,
        action: 'close',
        title: '¿Desea salir?',
        message: 'Tiene datos escritos. Si sale ahora, se perderán.',
        confirmText: 'Sí, salir'
      });
    } else {
      handleClose();
    }
  };

  const handleSubmitClick = () => {
    const valOld = oldPassword.trim();
    const valNew = newPassword.trim();
    const valConfirm = confirmPassword.trim();

    if (!valOld || !valNew || !valConfirm) {
      toast.error('Por favor, llena todos los campos');
      return;
    }

    if (valNew.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (valNew !== valConfirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      action: 'submit',
      title: 'Cambiar Contraseña',
      message: '¿Estás seguro de que deseas actualizar tu contraseña?',
      confirmText: 'Sí, actualizar'
    });
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      await pb.collection('users').update(userId, {
        oldPassword: oldPassword.trim(),
        password: newPassword.trim(),
        passwordConfirm: confirmPassword.trim(),
      });

      toast.success('Contraseña actualizada correctamente');
      handleClose();
    } catch (error: any) {
      console.error(error);
      // Custom error message for PocketBase password validation
      if (error.response?.data?.oldPassword) {
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error('Ocurrió un error al intentar cambiar la contraseña');
      }
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
      className={`fixed inset-0 z-[120] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
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
            Cambiar <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Contraseña</span>
          </h1>
        </div>

        <div className="w-[40px]"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-6 md:pt-8 w-full max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-6">
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6 items-center">
          
          <div className="bg-[#1A1F2E] p-4 rounded-full border border-white/10 mb-2">
            <Lock size={32} className="text-[#FFC107]" />
          </div>
          <p className="text-white/60 text-center font-medium mb-2">
            Para proteger tu cuenta, requerimos verificar tu contraseña actual antes de realizar el cambio.
          </p>

          <div className="flex flex-col gap-4 w-full">
            {/* Contraseña actual */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Contraseña actual *</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showOldPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Nueva contraseña *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Confirmar nueva contraseña *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl pl-5 pr-12 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
                  placeholder="Vuelve a escribir la nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 flex flex-col pb-8">
          <button 
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg cursor-pointer
              ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
            `}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
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
