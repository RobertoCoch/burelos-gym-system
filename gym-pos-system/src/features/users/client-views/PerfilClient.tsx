import { useState, useMemo } from 'react';
import { Edit2, ArrowDownUp, Filter, Loader2, Info } from 'lucide-react';
import { MdOutlineWorkspacePremium } from 'react-icons/md';
import { FaCartShopping } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import UserFormModal from '../../admin-views/users/UserFormModal';
import { format, parseISO, isBefore, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PerfilClient() {
  const currentUser = pb.authStore.model;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'membresia' | 'producto'>('todos');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Helpers para iniciales y colores (Misma lógica que AdminLayout)
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const stringToColor = (str: string) => {
    if (!str) return '#1A1F2E';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const avatarUrl = currentUser?.avatar 
    ? pb.files.getURL(currentUser, currentUser.avatar, { thumb: '200x200' })
    : null;

  // Consultas a BD
  const { data: membresiasActivas = [], isLoading: loadingMembresias } = useQuery({
    queryKey: ['membresias_activas', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      return await pb.collection('membresias_activas').getFullList({
        filter: `usuario = "${currentUser.id}"`,
        expand: 'plan',
        sort: '-created'
      });
    },
    enabled: !!currentUser?.id
  });

  const { data: pagosMembresias = [], isLoading: loadingPagosM } = useQuery({
    queryKey: ['pagos_membresias', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      return await pb.collection('pagos_membresias').getFullList({
        filter: `usuario = "${currentUser.id}"`,
        expand: 'plan',
        sort: '-fecha_pago'
      });
    },
    enabled: !!currentUser?.id
  });

  const { data: pagosProductos = [], isLoading: loadingPagosP } = useQuery({
    queryKey: ['pagos_productos', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      return await pb.collection('pagos_productos').getFullList({
        filter: `usuario = "${currentUser.id}"`,
        expand: 'producto',
        sort: '-fecha_pago'
      });
    },
    enabled: !!currentUser?.id
  });

  const isLoading = loadingMembresias || loadingPagosM || loadingPagosP;

  // --- Lógica Membresía Actual ---
  const activeMembership = membresiasActivas.length > 0 ? membresiasActivas[0] : null;
  let memStatus = 'Sin Membresía';
  let memColor = 'text-gray-400';
  let daysLeft = 0;
  
  if (activeMembership) {
    const vDate = parseISO(activeMembership.fecha_vencimiento);
    const now = new Date();
    daysLeft = differenceInDays(vDate, now);

    if (isBefore(vDate, now)) {
      memStatus = 'Vencido';
      memColor = 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]';
    } else if (daysLeft <= 3) {
      memStatus = 'Por Vencer';
      memColor = 'text-[#FFC107] drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]';
    } else {
      memStatus = 'Activo';
      memColor = 'text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    }
  }

  // --- Historial Combinado ---
  const history = useMemo(() => {
    const arr: any[] = [];
    
    pagosMembresias.forEach((p: any) => {
      arr.push({
        id: p.id,
        category: 'membresia',
        name: p.expand?.plan?.nombre || 'Membresía',
        price: p.monto_cobrado,
        date: p.fecha_pago
      });
    });

    pagosProductos.forEach((p: any) => {
      arr.push({
        id: p.id,
        category: 'producto',
        name: p.expand?.producto?.nombre || 'Producto',
        price: p.monto_cobrado,
        date: p.fecha_pago
      });
    });

    let filtered = arr;
    if (filterType !== 'todos') {
      filtered = filtered.filter(x => x.category === filterType);
    }

    filtered.sort((a, b) => {
      const tA = new Date(a.date).getTime();
      const tB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });

    return filtered;
  }, [pagosMembresias, pagosProductos, sortOrder, filterType]);

  return (
    <div className="flex flex-col w-full font-sans text-white" style={{ padding: '0 24px', paddingBottom: '32px' }}>
      
      {/* Big Avatar Header */}
      <div className="flex items-center gap-4 mt-6 mb-8">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-20 h-20 rounded-full object-cover shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0 border border-white/20"
          />
        ) : (
          <div 
            className="flex items-center justify-center w-20 h-20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0 border border-white/20"
            style={{ backgroundColor: stringToColor(currentUser?.id || '') }}
          >
            <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {getInitials(currentUser?.name || currentUser?.email || '')}
            </span>
          </div>
        )}

        <div className="flex flex-col items-start w-full">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm break-words leading-tight max-w-full pr-4">
            {currentUser?.name || currentUser?.email || 'Usuario'}
          </h1>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center w-8 h-8 mt-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-95 text-gray-300"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {/* Membresía Section */}
      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white/90 mb-4">Membresía</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin text-[#FFC107]" size={24} />
        </div>
      ) : activeMembership ? (
        <div className="flex flex-col bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-lg p-5 mb-8 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">
              <MdOutlineWorkspacePremium size={24} />
            </div>
            <span className="text-lg font-bold text-white">{activeMembership.expand?.plan?.nombre || 'Plan Activo'}</span>
          </div>
          <p className={`font-extrabold text-base mb-4 ${memColor}`}>{memStatus}</p>
          <p className="text-sm font-medium text-gray-300 mb-1">
            Vence el {format(parseISO(activeMembership.fecha_vencimiento), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-sm font-medium text-gray-300">
            {memStatus === 'Vencido' 
              ? 'Tu plan ha finalizado' 
              : `Te queda${daysLeft === 1 ? '' : 'n'} ${daysLeft} día${daysLeft === 1 ? '' : 's'} de entrenamiento`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-lg p-5 mb-8 items-center text-center">
          <Info className="text-gray-400 mb-2" size={32} />
          <p className="text-white font-bold mb-1">Sin membresía activa</p>
          <p className="text-sm text-gray-400">Acude a recepción para contratar un plan.</p>
        </div>
      )}

      {/* Compras Recientes Section */}
      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white/90 mb-4">Compras Recientes</h2>
      <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-colors text-sm font-bold active:scale-95 shrink-0 ${
            sortOrder === 'desc' ? 'bg-[#FFC107]/10 border-[#FFC107]/20 text-[#FFC107]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/90'
          }`}
        >
          <ArrowDownUp size={16} className={sortOrder === 'desc' ? 'text-[#FFC107]' : 'text-gray-400'} />
          Más recientes
        </button>
        <button 
          onClick={() => setFilterType(prev => prev === 'todos' ? 'membresia' : prev === 'membresia' ? 'producto' : 'todos')}
          className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-colors text-sm font-bold active:scale-95 shrink-0 ${
            filterType !== 'todos' ? 'bg-[#FFC107]/10 border-[#FFC107]/20 text-[#FFC107]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/90'
          }`}
        >
          <Filter size={16} className={filterType !== 'todos' ? 'text-[#FFC107]' : 'text-gray-400'} />
          {filterType === 'todos' ? 'Todos' : filterType === 'membresia' ? 'Membresías' : 'Productos'}
        </button>
      </div>

      {/* Tarjetas de compras */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="animate-spin text-[#FFC107]" size={24} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-bold bg-white/5 rounded-2xl border border-white/5">
            No tienes historial de compras.
          </div>
        ) : (
          history.map(item => (
            <div key={`${item.category}-${item.id}`} className="flex justify-between items-center bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="text-gray-300 shrink-0">
                  {item.category === 'producto' ? (
                    <FaCartShopping size={20} />
                  ) : (
                    <MdOutlineWorkspacePremium size={22} />
                  )}
                </div>
                <span className="text-white font-bold text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                  {item.name}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-white font-extrabold text-base sm:text-lg">${item.price}</span>
                <span className="text-gray-400 text-[10px] sm:text-xs font-medium">
                  {format(parseISO(item.date), "d MMM yyyy, h:mm a", { locale: es })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <UserFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userToEdit={currentUser}
      />
    </div>
  );
}
