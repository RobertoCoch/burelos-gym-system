import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../context/ToastContext';
import pb from '../../../lib/pocketbase';
import ConfirmModal from '../../../components/shared/ConfirmModal';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: any | null; // Nuevo prop para modo edición
}

export default function UserFormModal({ isOpen, onClose, userToEdit }: UserFormModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
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
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'client');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('client');
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
  }, [isOpen, userToEdit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const checkIfDirty = () => {
    if (userToEdit) {
      return name !== userToEdit.name || email !== userToEdit.email || password !== '' || imageFile !== null || role !== userToEdit.role;
    }
    return name !== '' || email !== '' || password !== '' || imageFile !== null;
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
    const valEmail = email.trim();
    const valPassword = password.trim();

    // La contraseña es opcional si estamos editando
    if (!valName || !valEmail || (!userToEdit && !valPassword) || !role) {
      toast.error('Por favor llene todos los campos obligatorios');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      action: 'submit',
      title: userToEdit ? 'Confirmar actualización' : 'Confirmar registro',
      message: userToEdit ? '¿Desea guardar los cambios del usuario?' : 'Está por registrar un usuario, ¿Desea continuar?',
      confirmText: userToEdit ? 'Sí, guardar' : 'Sí, registrar'
    });
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cleanPassword = password.trim();
      let payload: any;

      if (imageFile) {
        payload = new FormData();
        payload.append('name', name.trim());
        payload.append('email', email.trim());
        if (cleanPassword) {
          payload.append('password', cleanPassword);
          payload.append('passwordConfirm', cleanPassword);
        }
        payload.append('role', role);
        if (!userToEdit) {
          payload.append('emailVisibility', 'false');
        }
        payload.append('avatar', imageFile); 
      } else {
        payload = {
          name: name.trim(),
          email: email.trim(),
          role: role,
        };
        if (cleanPassword) {
          payload.password = cleanPassword;
          payload.passwordConfirm = cleanPassword;
        }
        if (!userToEdit) {
          payload.emailVisibility = false;
        }
      }

      if (userToEdit) {
        await pb.collection('users').update(userToEdit.id, payload);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await pb.collection('users').create(payload);
        toast.success('Usuario agregado exitosamente');
      }
      
      // Invalidar cache para recargar automáticamente
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      handleClose(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Error al guardar el usuario');
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
            {userToEdit ? 'Modificar' : 'Agregar'} <br className="sm:hidden" />
            <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Usuario</span>
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
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
              placeholder="Ej. Burelos"
            />
          </div>

          {/* Correo electronico */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Correo electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
              placeholder="Ej. burelos@gmail.com"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">
              Contraseña {userToEdit ? '(Opcional)' : '*'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner"
              placeholder={userToEdit ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
            />
          </div>

          {/* Rol */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Rol *</label>
            <div className="relative">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-white focus:outline-none focus:border-[#FFC107]/50 transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/60 pl-2">
                <ChevronDown size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Imagen (opcional)</label>
            <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-inner">
              <ImageIcon size={32} className="text-white/40" />
              <p className="font-bold text-white/90 text-sm md:text-base text-center">
                {imageFile ? imageFile.name : 'No hay imagen seleccionada'}
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
                className="bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-6 rounded-xl transition-colors text-sm border border-white/10"
              >
                Explorar archivos
              </button>
            </div>
          </div>

        </div>

        {/* Submit Button Area */}
        <div className="mt-4 flex flex-col pb-8">
          <button 
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg cursor-pointer
              ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
            `}
          >
            {isSubmitting 
              ? (userToEdit ? 'Guardando...' : 'Agregando...') 
              : (userToEdit ? 'Guardar Cambios' : 'Agregar')
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
