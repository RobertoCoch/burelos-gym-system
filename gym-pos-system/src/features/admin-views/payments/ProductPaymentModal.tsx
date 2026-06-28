import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, ScanLine, X, Search, Trash2, Minus, Plus, Loader2, Calendar } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import { useToast } from '../../../context/ToastContext';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { format } from 'date-fns';

interface ProductPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  product: any;
  quantity: number;
}

export default function ProductPaymentModal({ isOpen, onClose }: ProductPaymentModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Estados de Usuario
  const [isGuest, setIsGuest] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Estados de Producto (Fase 1)
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Estados de Pago
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Modales y cargas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = cartItems.length > 0 || selectedUserId !== '' || userSearchTerm !== '';

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

  // Click outside listener para cerrar dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
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

  const { data: productos = [] } = useQuery({
    queryKey: ['productos', 'list'],
    queryFn: async () => {
      return await pb.collection('productos').getFullList({ sort: 'nombre' });
    },
    enabled: isOpen,
  });

  const resetForm = () => {
    setIsGuest(false);
    setSelectedUserId('');
    setUserSearchTerm('');
    setIsUserDropdownOpen(false);
    setProductSearchTerm('');
    setIsProductDropdownOpen(false);
    setCartItems([]);
    setPaymentMethod('efectivo');
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

  // --- Lógica del Carrito de Productos ---
  
  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Stock máximo alcanzado (${product.stock})`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
    setProductSearchTerm('');
    setIsProductDropdownOpen(false);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error(`Stock máximo disponible: ${maxStock}`);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const total = cartItems.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);

  // --- Lógica de Filtros ---
  const filteredUsers = userSearchTerm.length >= 2 
    ? users.filter(u => {
        const term = userSearchTerm.toLowerCase();
        return (u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
      })
    : [];

  const filteredProducts = productSearchTerm.length >= 2
    ? productos.filter(p => p.nombre.toLowerCase().includes(productSearchTerm.toLowerCase()))
    : [];

  // --- Envío ---
  const handlePreSubmit = () => {
    if (cartItems.length === 0) {
      toast.error('Agrega al menos un producto al carrito');
      return;
    }
    if (!isGuest && !selectedUserId) {
      toast.error('Selecciona un usuario o marca la opción de invitado');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    try {
      // Registrar cada producto como un pago separado y descontar stock
      for (const item of cartItems) {
        // 1. Crear pago_producto
        await pb.collection('pagos_productos').create({
          usuario: isGuest ? null : selectedUserId,
          es_invitado: isGuest,
          producto: item.product.id,
          monto_cobrado: item.product.precio * item.quantity,
          cantidad: item.quantity, // Si la BD lo soporta
          metodo_pago: paymentMethod,
          fecha_pago: new Date(paymentDate).toISOString(),
        });

        // 2. Descontar stock
        const newStock = item.product.stock - item.quantity;
        await pb.collection('productos').update(item.product.id, {
          stock: newStock >= 0 ? newStock : 0
        });
      }

      toast.success('Pago de productos registrado exitosamente');
      
      // Refrescar vistas
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });

      executeClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Hubo un error al registrar el pago');
    } finally {
      setIsSubmitting(false);
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
        <button 
          onClick={handleClose}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={24} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight text-center">
            Pago de <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Productos</span>
          </h1>
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 md:px-12 pb-24 md:pb-12 pt-4 md:pt-8 flex flex-col md:flex-row gap-8 md:gap-16 w-full max-w-7xl mx-auto">
        
        {/* Columna Izquierda - Fase 1 y Fase 2 */}
        <div className="flex flex-col gap-8 flex-1">
          
          {/* Fase 1: Elegir Productos */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base md:text-lg font-bold tracking-tight text-white/90 px-1">Fase 1: Elegir Productos</h2>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
              
              {/* Buscador de Productos */}
              <div className="flex gap-3 relative" ref={productDropdownRef}>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-white/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Escribe 2 letras para buscar un producto..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className="w-full bg-[#1A1F2E] border border-white/5 text-[#FFC107] rounded-2xl py-4 pl-11 pr-5 text-[15px] md:text-base font-bold shadow-inner focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder:text-white/20 placeholder:font-medium"
                  />

                  {/* Dropdown Resultados Productos */}
                  {isProductDropdownOpen && productSearchTerm.length >= 2 && (
                    <div className="absolute z-20 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-sm font-bold text-white/50">
                          No se encontraron productos
                        </div>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => addToCart(p)}
                            disabled={p.stock <= 0}
                            className={`w-full text-left px-5 py-3 border-b border-white/5 transition-colors flex justify-between items-center last:border-0 ${p.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-black/20' : 'hover:bg-white/5'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-white/90 text-[15px]">{p.nombre}</span>
                              <span className="text-xs font-medium text-white/50">Stock disponible: {p.stock}</span>
                            </div>
                            <span className="font-extrabold text-[#FFC107]">${p.precio}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button 
                  disabled
                  className="bg-black/20 border border-white/5 text-white/30 rounded-2xl px-5 font-bold flex items-center justify-center gap-2 cursor-not-allowed transition-colors"
                >
                  <ScanLine size={18} />
                  <span className="hidden sm:inline">Escanear</span>
                </button>
              </div>

              {/* Lista de Productos en el Carrito */}
              <div className="flex flex-col gap-3">
                {cartItems.length === 0 ? (
                  <div className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-6 text-center shadow-inner">
                    <p className="text-white/40 font-bold text-sm">El carrito está vacío</p>
                    <p className="text-white/20 text-xs mt-1">Busca un producto para agregarlo</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.product.id} className="bg-[#1A1F2E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner">
                      
                      <div className="flex flex-col">
                        <span className="font-bold text-white/90 text-[15px] md:text-base">{item.product.nombre}</span>
                        <span className="text-[#FFC107] font-extrabold text-sm">${item.product.precio} c/u</span>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                        
                        {/* Controles de Cantidad */}
                        <div className="flex items-center bg-[#111827] rounded-xl border border-white/10 overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.product.stock)}
                            className="px-3 py-2 text-white hover:bg-white/10 transition-colors active:bg-white/20"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1, item.product.stock)}
                            className="w-12 bg-transparent text-center text-sm font-bold text-white focus:outline-none appearance-none"
                            min="1"
                            max={item.product.stock}
                          />
                          
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.product.stock)}
                            className="px-3 py-2 text-white hover:bg-white/10 transition-colors active:bg-white/20"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                        
                        <div className="w-[80px] text-right font-extrabold text-white">
                          ${(item.product.precio * item.quantity).toFixed(2)}
                        </div>

                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Fase 2: Datos del Usuario */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base md:text-lg font-bold tracking-tight text-white/90 px-1">Fase 2: Datos del Usuario</h2>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
              
              {/* Usuario Input (Buscador) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[13px] md:text-sm font-bold text-white/90">Usuario (Cliente)</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isGuest ? 'border-[#FFC107] bg-[#FFC107]/20' : 'border-white/30 group-hover:border-white/50'}`}>
                      {isGuest && <div className="w-2 h-2 rounded-full bg-[#FFC107]" />}
                    </div>
                    <span className="text-[12px] md:text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">Venta general (Invitado)</span>
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
                      value="Venta general (Invitado)"
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
                        placeholder="Escribe 2 letras para buscar un usuario..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setIsUserDropdownOpen(true);
                        }}
                        onFocus={() => setIsUserDropdownOpen(true)}
                        className="w-full bg-[#1A1F2E] border border-white/5 text-[#FFC107] rounded-2xl py-4 pl-11 pr-5 text-[15px] md:text-base font-bold shadow-inner focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder:text-white/20 placeholder:font-medium"
                      />
                      
                      {/* Dropdown Resultados */}
                      {isUserDropdownOpen && userSearchTerm.length >= 2 && (
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

              {/* Metodo de Pago */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[13px] md:text-sm font-bold text-white/90 px-1">Método de Pago</label>
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
              onClick={handlePreSubmit}
              disabled={isSubmitting || cartItems.length === 0}
              className={`w-full font-extrabold py-5 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)] flex justify-center items-center text-lg mt-2
                ${(isSubmitting || cartItems.length === 0) ? 'bg-[#FFC107]/50 text-black/50 cursor-not-allowed scale-95' : 'bg-[#FFC107] hover:bg-[#FFD54F] text-black active:scale-95'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Procesando...
                </>
              ) : (
                'Registrar'
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Confirmar Venta"
        message={`¿Estás seguro de registrar la venta de ${cartItems.length} producto(s) por un total de $${total.toFixed(2)} MXN?`}
        confirmText="Sí, registrar"
        cancelText="Cancelar"
        onConfirm={handleConfirmPayment}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Confirm Close Modal */}
      <ConfirmModal 
        isOpen={isCloseConfirmOpen}
        title="Descartar cambios"
        message="Tienes productos en el carrito. ¿Estás seguro de que deseas salir sin registrar el cobro?"
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
