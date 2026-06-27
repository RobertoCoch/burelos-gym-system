import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Mail, Loader2, Diamond } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserDetailsPanelProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: any) => void;
}

// Función auxiliar para obtener iniciales
const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Función auxiliar para obtener un color basado en un string (ej. ID o Nombre)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  const color = '#' + '00000'.substring(0, 6 - c.length) + c;
  return color;
};

export default function UserDetailsPanel({ userId, isOpen, onClose, onEdit }: UserDetailsPanelProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  // 1. Fetch User Data
  const { 
    data: user, 
    isLoading: isLoadingUser, 
    isError: isErrorUser 
  } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await pb.collection('users').getOne(userId);
    },
    enabled: !!userId,
  });

  // 2. Fetch Membership Data
  const { 
    data: membership, 
    isLoading: isLoadingMembership 
  } = useQuery({
    queryKey: ['membresias', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const record = await pb.collection('membresias_activas').getFirstListItem(`usuario="${userId}"`, {
          expand: 'plan'
        });
        return record;
      } catch (err: any) {
        if (err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!userId,
  });

  if (!isOpen && !isClosing && !isMounted) return null;

  const isLoading = isLoadingUser || isLoadingMembership;
  
  // URL del avatar real si existe
  const avatarUrl = user?.avatar 
    ? pb.files.getURL(user, user.avatar, { thumb: '200x200' })
    : null;

  // Lógica de Membresía
  const hasMembership = !!membership;
  const isExpired = membership?.estado === 'vencida';
  const planName = membership?.expand?.plan?.nombre || 'Desconocido';

  // Fechas formateadas
  const joinDate = user?.created ? format(parseISO(user.created), "d 'de' MMMM 'del' yyyy", { locale: es }) : '';
  const expDate = membership?.fecha_vencimiento ? format(parseISO(membership.fecha_vencimiento), "d 'de' MMMM 'del' yyyy", { locale: es }) : '';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end font-sans transition-opacity duration-300
        ${isMounted && !isClosing ? 'bg-black/40' : 'bg-transparent pointer-events-none'}
      `}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-md h-full bg-[#111827]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${isMounted && !isClosing ? 'translate-x-0' : 'translate-x-full'}
        `}
        onClick={e => e.stopPropagation()} // Prevenir cerrar al hacer clic dentro
      >
        {/* Header simple con back */}
        <div className="flex items-center px-6 py-5 shrink-0 border-b border-white/5">
          <button 
            onClick={handleClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 cursor-pointer text-white"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col items-center gap-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="animate-spin text-[#FFC107] mb-2" size={32} />
              <p className="text-white/60 text-sm">Cargando información...</p>
            </div>
          ) : isErrorUser || !user ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-red-400 text-sm font-bold">Error al cargar el usuario</p>
            </div>
          ) : (
            <>
              {/* Avatar e Info Principal */}
              <div className="flex flex-col items-center gap-3 w-full">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-lg"
                  />
                ) : (
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white/10 shadow-lg"
                    style={{ backgroundColor: stringToColor(user.id) }}
                  >
                    <span className="text-4xl font-extrabold text-white drop-shadow-md">
                      {getInitials(user.name || user.email)}
                    </span>
                  </div>
                )}

                <div className="text-center mt-2">
                  <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)] leading-tight text-center break-words max-w-xs">
                    {user.name || user.email}
                  </h2>
                </div>
              </div>

              {/* Sección Membresía */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 mt-4 shadow-inner">
                <div className="flex items-center gap-2">
                  <Diamond className="text-[#3b82f6]" size={20} fill="#3b82f6" />
                  <span className="text-white font-bold text-lg">Membresía:</span>
                  <span className="text-[#FFC107] font-bold text-lg ml-1">
                    {hasMembership ? planName : 'Sin asignar'}
                  </span>
                </div>
                
                {hasMembership ? (
                  <div className="flex flex-col mt-1">
                    <span className={`font-extrabold text-base ${isExpired ? 'text-red-500' : 'text-[#22c55e]'}`}>
                      {isExpired ? 'Vencido' : 'Activo'}
                    </span>
                    {!isExpired && expDate && (
                      <span className="text-white/60 text-sm mt-1">
                        Vence el {expDate}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Información General */}
              <div className="w-full flex flex-col mt-2 gap-4 relative">
                <h3 className="text-white font-bold text-lg">Información</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-white/40" />
                    <span className="text-white/70 text-sm">Se unió el {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-white/40" />
                    <a href={`mailto:${user.email}`} className="text-[#FFC107] hover:underline text-sm break-all">
                      {user.email}
                    </a>
                  </div>
                </div>

                {/* Botón Modificar */}
                <div className="absolute right-0 top-0">
                  <button 
                    onClick={() => onEdit(user)}
                    className="flex items-center gap-2 bg-[#FFC107] hover:bg-[#ffca28] text-black font-bold py-2 px-4 rounded-xl transition-colors shadow-sm active:scale-95"
                  >
                    <Edit size={16} /> Modificar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
