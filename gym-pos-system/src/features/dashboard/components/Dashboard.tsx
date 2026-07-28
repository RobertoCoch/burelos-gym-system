import { AlertTriangle, Loader2 } from "lucide-react";
import { GiGymBag } from 'react-icons/gi';
import { FaCartShopping } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import { format, subMonths, isAfter, isBefore, addDays, startOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';

const LOW_STOCK_THRESHOLD = 1;

export default function Dashboard() {

  // --- Consultas a BD ---
  const { data: pagosMembresias = [], isLoading: isLoadingPagosM } = useQuery({
    queryKey: ['pagos_membresias'],
    queryFn: async () => await pb.collection('pagos_membresias').getFullList()
  });

  const { data: pagosProductos = [], isLoading: isLoadingPagosP } = useQuery({
    queryKey: ['pagos_productos'],
    queryFn: async () => await pb.collection('pagos_productos').getFullList()
  });

  const { data: membresiasActivas = [], isLoading: isLoadingMembresias } = useQuery({
    queryKey: ['membresias_activas'],
    queryFn: async () => await pb.collection('membresias_activas').getFullList()
  });

  const { data: productos = [], isLoading: isLoadingProductos } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => await pb.collection('productos').getFullList()
  });

  const { data: equipo = [], isLoading: isLoadingEquipo } = useQuery({
    queryKey: ['equipo_gym'],
    queryFn: async () => await pb.collection('equipo_gym').getFullList()
  });

  const isLoading = isLoadingPagosM || isLoadingPagosP || isLoadingMembresias || isLoadingProductos || isLoadingEquipo;

  // --- Ingresos del Mes Actual ---
  const { currentMembresias, currentProductos, totalCurrent } = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    
    const sumM = pagosMembresias
      .filter(p => isAfter(parseISO(p.fecha_pago), startOfCurrentMonth))
      .reduce((sum, p) => sum + p.monto_cobrado, 0);
      
    const sumP = pagosProductos
      .filter(p => isAfter(parseISO(p.fecha_pago), startOfCurrentMonth))
      .reduce((sum, p) => sum + p.monto_cobrado, 0);

    return {
      currentMembresias: sumM,
      currentProductos: sumP,
      totalCurrent: sumM + sumP
    };
  }, [pagosMembresias, pagosProductos]);

  const percentageMembresias = totalCurrent > 0 ? Math.round((currentMembresias / totalCurrent) * 100) : 0;
  const percentageProductos = totalCurrent > 0 ? 100 - percentageMembresias : 0;

  // --- Últimos 5 Meses ---
  const last5Months = useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Generar arreglo de últimos 5 meses (del más antiguo al más reciente)
    for (let i = 4; i >= 0; i--) {
      const d = subMonths(now, i);
      const monthName = format(d, 'MMMM', { locale: es });
      
      const isSameMonthYear = (isoDate: string) => {
        const pd = parseISO(isoDate);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      };
      
      const mSum = pagosMembresias.filter(p => isSameMonthYear(p.fecha_pago)).reduce((s, p) => s + p.monto_cobrado, 0);
      const pSum = pagosProductos.filter(p => isSameMonthYear(p.fecha_pago)).reduce((s, p) => s + p.monto_cobrado, 0);
      
      months.push({
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        value: mSum + pSum
      });
    }

    // Calcular el valor máximo para escalar la gráfica
    // Multiplicamos por 1.2 para que la barra más alta no toque el techo
    const maxVal = Math.max(...months.map(m => m.value), 1) * 1.2; 
    
    return months.map(m => ({
      ...m,
      max: maxVal
    }));
  }, [pagosMembresias, pagosProductos]);

  // --- Clientes (Membresías Activas) ---
  const { activos, porVencer, vencidos, totalClientes } = useMemo(() => {
    let act = 0;
    let prv = 0;
    let ven = 0;
    const now = new Date();
    const alertDate = addDays(now, 3);

    membresiasActivas.forEach(m => {
      const vDate = parseISO(m.fecha_vencimiento);
      if (isBefore(vDate, now)) {
        ven++;
      } else if (isBefore(vDate, alertDate)) {
        prv++;
      } else {
        act++;
      }
    });

    return { activos: act, porVencer: prv, vencidos: ven, totalClientes: act + prv + ven };
  }, [membresiasActivas]);

  // Gradiente dinámico
  const conicGradient = useMemo(() => {
    if (totalClientes === 0) return 'conic-gradient(#1e293b 0deg, #1e293b 360deg)';
    
    const pAct = (activos / totalClientes) * 360;
    const pPrv = (porVencer / totalClientes) * 360;
    const pVen = (vencidos / totalClientes) * 360;
    
    const deg1 = pAct;
    const deg2 = deg1 + pPrv;
    const deg3 = deg2 + pVen;
    
    return `conic-gradient(
      #8b5cf6 0deg ${deg1}deg, 
      #FFC107 ${deg1}deg ${deg2}deg, 
      #ef4444 ${deg2}deg ${deg3}deg
    )`;
  }, [activos, porVencer, vencidos, totalClientes]);

  // --- Inventario ---
  const totalProductosStock = productos.length;
  const lowStockProducts = productos.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;

  const totalEquipoVariedades = equipo.length;
  const totalEquiposEnMantenimiento = equipo.reduce((acc, eq) => acc + (eq.cantidad_mantenimiento || 0), 0);


  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#FFC107] mb-4" size={48} />
        <p className="font-bold text-white/50 animate-pulse">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>

      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          Panel de<br />
          <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Administrador</span>
        </h1>
      </div>

      {/* Top Row Container (Ingresos & Clientes on Desktop) */}
      <div className="flex flex-col lg:flex-row lg:gap-8" style={{ padding: '0 24px', marginBottom: '32px' }}>

        {/* Ingresos Section */}
        <div className="flex-[2] mb-8 lg:mb-0">
          <h2 className="text-xl font-extrabold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Ingresos</h2>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[calc(100%-44px)] flex flex-col" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <p className="text-sm font-semibold tracking-wide text-gray-400">Ingresos del mes actual</p>
              <p className="text-3xl font-extrabold tracking-tight text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">
                ${totalCurrent.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ marginBottom: '24px', gap: '24px' }}>
              <div className="flex flex-col" style={{ gap: '12px' }}>
                <div className="flex items-center">
                  <div className="bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '8px', height: '8px', marginRight: '8px' }}></div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-300" style={{ lineHeight: '1', marginBottom: '4px' }}>Membresías</p>
                    <p className="text-xs font-bold text-white" style={{ lineHeight: '1' }}>${currentMembresias.toLocaleString('es-MX')} MXN</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#FFC107] rounded-full shadow-[0_0_10px_rgba(255,193,7,0.5)]" style={{ width: '8px', height: '8px', marginRight: '8px' }}></div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-300" style={{ lineHeight: '1', marginBottom: '4px' }}>Productos</p>
                    <p className="text-xs font-bold text-[#FFC107]" style={{ lineHeight: '1' }}>${currentProductos.toLocaleString('es-MX')} MXN</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex w-full sm:w-1/2 rounded-full overflow-hidden font-bold text-xs shadow-inner bg-black/20" style={{ height: '32px' }}>
                {totalCurrent > 0 ? (
                  <>
                    <div className="bg-white/20 backdrop-blur-sm h-full flex items-center justify-center text-white transition-all" style={{ width: `${percentageMembresias}%` }}>
                      {percentageMembresias > 10 ? `${percentageMembresias}%` : ''}
                    </div>
                    <div className="bg-[#FFC107]/80 backdrop-blur-sm h-full flex items-center justify-center text-[#111827] transition-all" style={{ width: `${percentageProductos}%` }}>
                      {percentageProductos > 10 ? `${percentageProductos}%` : ''}
                    </div>
                  </>
                ) : (
                  <div className="w-full text-white/30 font-medium flex items-center justify-center text-[10px]">Sin ingresos</div>
                )}
              </div>
            </div>

            <div className="bg-white/10" style={{ height: '1px', width: '100%', marginBottom: '24px' }}></div>

            <p className="text-sm font-semibold tracking-wide text-gray-400" style={{ marginBottom: '24px' }}>Últimos meses</p>

            <div className="flex justify-between items-end flex-1" style={{ minHeight: '160px' }}>
              {/* Bars */}
              {last5Months.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginBottom: '8px' }}>
                    ${item.value.toLocaleString('es-MX')}
                  </span>
                  <div
                    className={`bg-gradient-to-t border rounded-t-lg transition-all shadow-[0_0_10px_rgba(255,193,7,0.2)] 
                      ${item.value === 0 
                        ? 'from-white/5 to-white/10 border-white/10 group-hover:bg-white/20 shadow-none' 
                        : 'from-[#FFC107]/40 to-[#FFC107] border-[#FFC107]/50 group-hover:to-yellow-300 group-hover:-translate-y-1'}`}
                    style={{
                      width: '60%',
                      maxWidth: '40px',
                      height: item.value === 0 ? '4px' : `${(item.value / item.max) * 110}px` // 110px es aprox max height visual
                    }}
                  ></div>
                  <span className="text-[10px] font-semibold text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" style={{ marginTop: '8px' }}>
                    {item.label.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clientes Section */}
        <div className="flex-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Clientes</h2>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-white flex flex-row items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[calc(100%-44px)]" style={{ padding: '32px 24px', gap: '32px' }}>

            {/* Doughnut Chart Dinámico */}
            <div className="relative flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer" style={{ width: '130px', height: '130px' }}>
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(255,193,7,0.2)] transition-all duration-700 ease-in-out"
                style={{
                  background: conicGradient
                }}>
              </div>
              <div className="absolute bg-[#141a27] rounded-full flex flex-col items-center justify-center" style={{ width: '80px', height: '80px' }}>
                <span className="text-2xl font-extrabold text-white leading-none">{totalClientes}</span>
                <span className="text-[9px] font-bold text-white/50">Total</span>
              </div>
            </div>

            <div className="flex flex-col justify-center" style={{ gap: '16px' }}>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Activos</p>
                <p className="text-xl font-extrabold tracking-tight text-[#8b5cf6] group-hover:scale-110 transition-transform origin-left" style={{ lineHeight: '1', marginTop: '4px' }}>
                  {activos}
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Por vencer</p>
                <p className="text-xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]" style={{ lineHeight: '1', marginTop: '4px' }}>
                  {porVencer}
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Vencidos</p>
                <p className="text-xl font-extrabold tracking-tight text-red-400 group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]" style={{ lineHeight: '1', marginTop: '4px' }}>
                  {vencidos}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Inventario Section */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h2 className="text-xl font-extrabold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Inventario</h2>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-white grid grid-cols-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" style={{ padding: '24px 16px' }}>

          <div className="flex flex-col items-center text-center group cursor-pointer hover:bg-white/5 rounded-xl transition-colors" style={{ padding: '16px 8px' }}>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors" style={{ marginBottom: '16px' }}>Equipo</p>
            <GiGymBag size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md" style={{ marginBottom: '16px' }} />
            <p className="text-4xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]" style={{ marginBottom: '12px' }}>
              {totalEquipoVariedades}
            </p>
            <div className={`flex items-center text-xs font-bold ${totalEquiposEnMantenimiento > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {totalEquiposEnMantenimiento > 0 && <AlertTriangle size={14} className="text-red-400" style={{ marginRight: '6px' }} />}
              {totalEquiposEnMantenimiento > 0 ? `${totalEquiposEnMantenimiento} en reparación` : 'Todo en buen estado'}
            </div>
          </div>

          <div className="flex flex-col items-center text-center border-l border-white/10 group cursor-pointer hover:bg-white/5 rounded-xl transition-colors" style={{ padding: '16px 8px' }}>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors" style={{ marginBottom: '16px' }}>Productos</p>
            <FaCartShopping size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md" style={{ marginBottom: '16px' }} />
            <p className="text-4xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]" style={{ marginBottom: '12px' }}>
              {totalProductosStock}
            </p>
            <div className={`flex items-center text-xs font-bold ${lowStockProducts > 0 ? 'text-[#FFC107]' : 'text-gray-400'}`}>
              {lowStockProducts > 0 && <AlertTriangle size={14} className="text-[#FFC107]" style={{ marginRight: '6px' }} />}
              {lowStockProducts > 0 ? `${lowStockProducts} con bajo stock` : 'Stock saludable'}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
