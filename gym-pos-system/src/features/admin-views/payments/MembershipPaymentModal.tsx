import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, ChevronDown, Calendar, Loader2, Search, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, addMonths, addYears, format, parseISO } from 'date-fns';
import pb from '../../../lib/pocketbase';
import { useToast } from '../../../context/ToastContext';
import ConfirmModal from '../../../components/shared/ConfirmModal';

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MembershipPaymentModal({ isOpen, onClose }: MembershipPaymentModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [isGuest, setIsGuest] = useState(false);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const planDropdownRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = isGuest || selectedUserId !== '' || userSearchTerm !== '' || selectedPlanId !== '' || customAmount !== '';

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      resetForm();
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target as Node)) {
        setIsPlanDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Consultas
  const { data: users = [] } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      return await pb.collection('users').getFullList({ sort: 'name' });
    },
    enabled: isOpen,
  });

  const { data: planes = [] } = useQuery({
    queryKey: ['planes', 'list'],
    queryFn: async () => {
      return await pb.collection('planes').getFullList({ sort: 'precio' });
    },
    enabled: isOpen,
  });

  const selectedPlan = planes.find(p => p.id === selectedPlanId);

  // Autocompletar precio cuando cambia el plan
  useEffect(() => {
    if (selectedPlan) {
      setCustomAmount(selectedPlan.precio.toString());
    } else {
      setCustomAmount('');
    }
  }, [selectedPlanId, selectedPlan]);

  const resetForm = () => {
    setIsGuest(false);
    setSelectedUserId('');
    setUserSearchTerm('');
    setIsUserDropdownOpen(false);
    setSelectedPlanId('');
    setIsPlanDropdownOpen(false);
    setPaymentMethod('efectivo');
    setCustomAmount('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges && !isCloseConfirmOpen) {
      setIsCloseConfirmOpen(true);
    } else {
      executeClose();
    }
  };

  const executeClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  const calculateExpirationDate = (startDateStr: string, tipoDuracion: string) => {
    const startDate = parseISO(startDateStr);
    switch (tipoDuracion) {
      case 'diario': return addDays(startDate, 1);
      case 'semanal': return addDays(startDate, 7);
      case 'quincenal': return addDays(startDate, 15);
      case 'mensual': return addMonths(startDate, 1);
      case 'anual': return addYears(startDate, 1);
      default: return addDays(startDate, 30);
    }
  };

  const handlePreSubmit = async () => {
    if (!isGuest && !selectedUserId) {
      toast.error('Selecciona un usuario o marca la opción de invitado');
      return;
    }
    if (!selectedPlanId) {
      toast.error('Debes seleccionar un plan de membresía');
      return;
    }
    if (!customAmount || isNaN(Number(customAmount))) {
      toast.error('El monto debe ser un número válido');
      return;
    }
    
    // Verificar si el usuario ya tiene una membresía activa
    if (!isGuest && selectedUserId) {
      setIsSubmitting(true);
      try {
        const existingMembresias = await pb.collection('membresias_activas').getFullList({
          filter: `usuario = "${selectedUserId}" && estado = "activa"`
        });
        if (existingMembresias.length > 0) {
          toast.error('El usuario ya tiene una membresía activa');
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Error verificando membresía activa:', error);
      }
      setIsSubmitting(false);
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      let finalDateStr = '';
      if (paymentDate === todayStr) {
        finalDateStr = new Date().toISOString();
      } else {
        const [year, month, day] = paymentDate.split('-');
        finalDateStr = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0).toISOString();
      }

      // 1. Crear el registro en pagos_membresias
      const paymentData = {
        usuario: isGuest ? null : selectedUserId,
        es_invitado: isGuest,
        plan: selectedPlanId,
        monto_cobrado: Number(customAmount),
        metodo_pago: paymentMethod,
        fecha_pago: finalDateStr,
      };

      await pb.collection('pagos_membresias').create(paymentData);

      // 2. Si no es invitado, actualizar/crear la membresía activa
      if (!isGuest && selectedPlan) {
        const expDate = calculateExpirationDate(paymentDate, selectedPlan.tipo_duracion);
        
        // Buscar si ya tiene una membresía
        const existingMembresias = await pb.collection('membresias_activas').getFullList({
          filter: `usuario = "${selectedUserId}"`
        });

        const activeMembershipData = {
          usuario: selectedUserId,
          plan: selectedPlanId,
          fecha_inicio: finalDateStr,
          fecha_vencimiento: expDate.toISOString(),
          estado: 'activa'
        };

        if (existingMembresias.length > 0) {
          // Actualizar la existente
          await pb.collection('membresias_activas').update(existingMembresias[0].id, activeMembershipData);
        } else {
          // Crear nueva
          await pb.collection('membresias_activas').create(activeMembershipData);
        }
      }

      toast.success('Pago registrado exitosamente');
      
      // Refrescar las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['membresias'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      executeClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Hubo un error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = userSearchTerm.toLowerCase();
    return (u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
  });

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col font-sans text-white bg-[#0f172a] transition-transform duration-300 ease-in-out
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
            Pago de <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Membresía</span>
          </h1>
        </div>

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
              
              {/* Usuario Input (Buscador) */}
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
                      onChange={() => {
                        setIsGuest(!isGuest);
                        if (!isGuest) {
                          setSelectedUserId('');
                          setUserSearchTerm('');
                        }
                      }} 
                    />
                  </label>
                </div>
                
                <div className="relative" ref={userDropdownRef}>
                  {isGuest ? (
                    <input
                      type="text"
                      disabled
                      value="Invitado"
                      className="w-full bg-[#1A1F2E] border border-white/5 text-white/50 cursor-not-allowed rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold shadow-inner focus:outline-none"
                    />
                  ) : selectedUserId ? (
                    <div className="flex items-center justify-between w-full bg-[#FFC107]/10 border border-[#FFC107] rounded-2xl px-5 py-4 shadow-[0_0_15px_rgba(255,193,7,0.15)] transition-all">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-[#FFC107] text-[15px] md:text-base truncate">
                          {userSearchTerm}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId('');
                          setUserSearchTerm('');
                          // Al darle timeout le damos tiempo a react a hacer render antes de abrir el dropdown automáticamente
                          setTimeout(() => setIsUserDropdownOpen(true), 0);
                        }}
                        className="ml-3 p-1.5 rounded-full hover:bg-[#FFC107]/20 text-[#FFC107] transition-colors shrink-0"
                      >
                        <X size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-white/40" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar usuario por nombre o correo..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setIsUserDropdownOpen(true);
                        }}
                        onFocus={() => setIsUserDropdownOpen(true)}
                        className="w-full bg-[#1A1F2E] border border-white/5 text-[#FFC107] rounded-2xl py-4 pl-11 pr-5 text-[15px] md:text-base font-bold shadow-inner focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder:text-white/20 placeholder:font-medium"
                      />
                      
                      {/* Dropdown Resultados */}
                      {isUserDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                          {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm font-bold text-white/50">
                              No se encontraron usuarios
                            </div>
                          ) : (
                            filteredUsers.map(u => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  setSelectedUserId(u.id);
                                  setUserSearchTerm(u.name || u.email);
                                  setIsUserDropdownOpen(false);
                                }}
                                className="w-full text-left px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex flex-col last:border-0"
                              >
                                <span className="font-bold text-white/90 text-[15px]">{u.name || u.email}</span>
                                {u.name && <span className="text-xs text-white/50 font-medium">{u.email}</span>}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Plan Input (Dropdown Scrollable) */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Plan *</label>
                <div className="relative" ref={planDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                    className="w-full bg-[#FFC107] border border-[#FFC107]/20 rounded-2xl px-5 py-4 flex justify-between items-center text-[15px] md:text-base font-bold text-black focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                  >
                    <span className="truncate pr-4">
                      {selectedPlan ? `${selectedPlan.nombre} - $${selectedPlan.precio}` : 'Seleccionar plan...'}
                    </span>
                    <ChevronDown size={20} strokeWidth={2.5} className={`transition-transform duration-200 shrink-0 ${isPlanDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Resultados (Max 4 items ~ 220px, scroll if more) */}
                  {isPlanDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-[220px] overflow-y-auto backdrop-blur-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                      {planes.length === 0 ? (
                        <div className="p-4 text-center text-sm font-bold text-white/50">
                          No hay planes registrados
                        </div>
                      ) : (
                        planes.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPlanId(p.id);
                              setIsPlanDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 border-b border-white/5 transition-colors flex justify-between items-center last:border-0
                              ${selectedPlanId === p.id ? 'bg-[#FFC107]/10' : 'hover:bg-white/5'}
                            `}
                          >
                            <span className={`font-bold text-[15px] ${selectedPlanId === p.id ? 'text-[#FFC107]' : 'text-white/90'}`}>
                              {p.nombre}
                            </span>
                            <span className="font-extrabold text-white/60">
                              ${p.precio}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Fecha de Pago</label>
                <div className="relative">
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-[#1A1F2E] border border-white/5 rounded-2xl px-5 py-4 text-[15px] md:text-base font-bold text-[#FFC107] focus:outline-none focus:border-[#FFC107]/50 transition-colors shadow-inner [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-5 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <Calendar size={18} strokeWidth={2.5} />
                  </div>
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
              <div className="flex items-center text-5xl font-extrabold text-white group">
                <span className="text-3xl mr-1 opacity-70 group-hover:opacity-100 transition-opacity">$</span>
                <input 
                  type="text" 
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-transparent w-full max-w-[150px] text-center focus:outline-none focus:border-b-2 focus:border-[#FFC107]/50 border-b-2 border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <span className="text-2xl font-bold text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">MXN</span>
            </div>
            
            <button 
              onClick={handlePreSubmit}
              disabled={isSubmitting}
              className={`w-full font-extrabold py-5 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg mt-2
                ${isSubmitting ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Procesando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Confirmar Pago"
        message={`¿Estás seguro de registrar el pago de membresía por $${customAmount} MXN?`}
        confirmText="Sí, registrar"
        cancelText="Cancelar"
        onConfirm={handleConfirmPayment}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Confirm Close Modal */}
      <ConfirmModal 
        isOpen={isCloseConfirmOpen}
        title="Descartar cambios"
        message="Tienes información sin guardar. ¿Estás seguro de que deseas salir?"
        confirmText="Sí, salir"
        cancelText="Continuar editando"
        onConfirm={() => {
          setIsCloseConfirmOpen(false);
          executeClose();
        }}
        onCancel={() => setIsCloseConfirmOpen(false)}
      />
    </div>
  );
}
