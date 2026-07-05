import { ArrowDownUp, Filter, Loader2 } from 'lucide-react';
import { MdOutlineWorkspacePremium } from 'react-icons/md';
import { FaCartShopping } from 'react-icons/fa6';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import MembershipPaymentModal from './MembershipPaymentModal';
import ProductPaymentModal from './ProductPaymentModal';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PaymentView() {
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // States para filtros
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState<'todos' | 'membresia' | 'producto'>('todos');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Consultas
  const { data: pagosMembresias = [], isLoading: loadingMembresias } = useQuery({
    queryKey: ['pagos', 'membresias'],
    queryFn: async () => {
      try {
        return await pb.collection('pagos_membresias').getFullList({ expand: 'usuario,plan' });
      } catch (error) {
        console.warn('Error cargando pagos_membresias:', error);
        return [];
      }
    },
    retry: false
  });

  const { data: pagosProductos = [], isLoading: loadingProductos } = useQuery({
    queryKey: ['pagos', 'productos'],
    queryFn: async () => {
      try {
        return await pb.collection('pagos_productos').getFullList({ expand: 'usuario,producto' });
      } catch (error) {
        console.warn('Error cargando pagos_productos:', error);
        return [];
      }
    },
    retry: false
  });

  const unifiedHistory = useMemo(() => {
    const arr: any[] = [];
    
    pagosMembresias.forEach((p: any) => {
      arr.push({
        id: p.id,
        category: 'membresia',
        type: p.expand?.plan?.nombre || 'Membresía',
        name: p.es_invitado ? 'Invitado' : (p.expand?.usuario?.name || p.expand?.usuario?.email || 'Desconocido'),
        price: p.monto_cobrado,
        date: p.fecha_pago
      });
    });

    pagosProductos.forEach((p: any) => {
      arr.push({
        id: p.id,
        category: 'producto',
        type: p.expand?.producto?.nombre || 'Producto',
        name: p.es_invitado ? 'Invitado' : (p.expand?.usuario?.name || p.expand?.usuario?.email || 'Desconocido'),
        price: p.monto_cobrado,
        date: p.fecha_pago
      });
    });

    // Filtros
    let filtered = arr;
    if (filterType !== 'todos') {
      filtered = filtered.filter(x => x.category === filterType);
    }

    // Orden
    filtered.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [pagosMembresias, pagosProductos, sortOrder, filterType]);

  const visibleHistory = unifiedHistory.slice(0, displayLimit);
  const isLoading = loadingMembresias || loadingProductos;
  const hasMore = unifiedHistory.length > displayLimit;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          Sección de<br/>
          <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Pagos</span>
        </h1>
      </div>

      {/* Agregar pago Section */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h2 className="text-lg font-bold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Agregar pago +</h2>
        
        <div className="grid grid-cols-2 lg:flex lg:flex-row lg:justify-start lg:gap-4" style={{ gap: '16px' }}>
          <button 
            onClick={() => setIsMembershipModalOpen(true)}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group py-8 px-4 lg:py-6 lg:px-6 lg:w-40 lg:h-36">
            <p className="text-base font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-3">Membresía</p>
            <MdOutlineWorkspacePremium size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" />
          </button>
          
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group py-8 px-4 lg:py-6 lg:px-6 lg:w-40 lg:h-36">
            <p className="text-base font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-3">Productos</p>
            <FaCartShopping size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" />
          </button>
        </div>
      </div>

      {/* Historial Section */}
      <div className="flex-1 flex flex-col" style={{ padding: '0 24px' }}>
        
        <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '16px' }}>
          <h2 className="text-lg font-bold tracking-tight text-white/90">Historial</h2>
          
          {/* Controles de Filtros */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                setDisplayLimit(10); // reset page on sort
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold active:scale-95 text-white/90"
            >
              <ArrowDownUp size={16} className={sortOrder === 'desc' ? 'text-[#FFC107]' : 'text-white/70'} />
              {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold active:scale-95 text-white/90"
              >
                <Filter size={16} className={filterType !== 'todos' ? 'text-[#FFC107]' : 'text-white/70'} />
                {filterType === 'todos' ? 'Todos' : filterType === 'membresia' ? 'Membresías' : 'Productos'}
              </button>
              
              {isFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl z-20 overflow-hidden backdrop-blur-xl">
                    <button 
                      onClick={() => { setFilterType('todos'); setDisplayLimit(10); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${filterType === 'todos' ? 'bg-[#FFC107]/10 text-[#FFC107]' : 'text-white/80 hover:bg-white/5'}`}
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => { setFilterType('membresia'); setDisplayLimit(10); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-t border-white/5 ${filterType === 'membresia' ? 'bg-[#FFC107]/10 text-[#FFC107]' : 'text-white/80 hover:bg-white/5'}`}
                    >
                      Membresías
                    </button>
                    <button 
                      onClick={() => { setFilterType('producto'); setDisplayLimit(10); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-t border-white/5 ${filterType === 'producto' ? 'bg-[#FFC107]/10 text-[#FFC107]' : 'text-white/80 hover:bg-white/5'}`}
                    >
                      Productos
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable list content */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-[#FFC107]" size={32} />
            </div>
          ) : visibleHistory.length === 0 ? (
            <div className="text-center py-10 text-white/50 font-bold">
              No hay pagos registrados para este filtro.
            </div>
          ) : (
            visibleHistory.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors" style={{ padding: '16px' }}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {payment.category === 'membresia' ? (
                      <MdOutlineWorkspacePremium size={14} className="text-[#FFC107]" />
                    ) : (
                      <FaCartShopping size={14} className="text-[#FFC107]" />
                    )}
                    <span className="text-[#FFC107] font-bold text-sm md:text-base drop-shadow-[0_0_8px_rgba(255,193,7,0.3)] truncate max-w-[150px] md:max-w-none">
                      {payment.type}
                    </span>
                  </div>
                  <span className="text-gray-300 font-medium text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{payment.name}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-white font-extrabold text-lg">${payment.price}</span>
                  <span className="text-gray-400 text-[10px] md:text-xs font-medium text-right leading-tight">
                    {format(parseISO(payment.date), "d MMM yyyy, h:mm a", { locale: es })}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {/* Cargar más Button */}
          {hasMore && (
            <button 
              onClick={() => setDisplayLimit(prev => prev + 10)}
              className="mt-4 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold py-3 rounded-2xl transition-colors active:scale-95"
            >
              Cargar más resultados ({unifiedHistory.length - displayLimit} restantes)
            </button>
          )}
        </div>
      </div>

      <MembershipPaymentModal 
        isOpen={isMembershipModalOpen} 
        onClose={() => setIsMembershipModalOpen(false)} 
      />
      <ProductPaymentModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
      />
    </div>
  );
}
