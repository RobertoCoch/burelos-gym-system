import { Dumbbell, Package, Wrench, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>

      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          Bienvenido a tu<br />
          <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Dashboard</span>
        </h1>
      </div>

      {/* Top Row Container (Ingresos & Clientes on Desktop) */}
      <div className="flex flex-col lg:flex-row lg:gap-8" style={{ padding: '0 24px', marginBottom: '32px' }}>
        
        {/* Ingresos Section */}
        <div className="flex-[2] mb-8 lg:mb-0">
          <h2 className="text-xl font-extrabold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Ingresos</h2>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[calc(100%-44px)] flex flex-col" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <p className="text-sm font-semibold tracking-wide text-gray-400">Ingresos del mes</p>
              <p className="text-3xl font-extrabold tracking-tight text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">$24,500 MXN</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ marginBottom: '24px', gap: '24px' }}>
              <div className="flex flex-col" style={{ gap: '12px' }}>
                <div className="flex items-center">
                  <div className="bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '8px', height: '8px', marginRight: '8px' }}></div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-300" style={{ lineHeight: '1', marginBottom: '4px' }}>Membresias</p>
                    <p className="text-xs font-bold text-white" style={{ lineHeight: '1' }}>$14,500 MXN</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#FFC107] rounded-full shadow-[0_0_10px_rgba(255,193,7,0.5)]" style={{ width: '8px', height: '8px', marginRight: '8px' }}></div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-300" style={{ lineHeight: '1', marginBottom: '4px' }}>Productos</p>
                    <p className="text-xs font-bold text-[#FFC107]" style={{ lineHeight: '1' }}>$10,000 MXN</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex w-full sm:w-1/2 rounded-full overflow-hidden font-bold text-xs shadow-inner bg-black/20" style={{ height: '32px' }}>
                <div className="bg-white/20 backdrop-blur-sm h-full flex items-center justify-center text-white transition-all" style={{ width: '60%' }}>60%</div>
                <div className="bg-[#FFC107]/80 backdrop-blur-sm h-full flex items-center justify-center text-[#111827] transition-all" style={{ width: '40%' }}>40%</div>
              </div>
            </div>

            <div className="bg-white/10" style={{ height: '1px', width: '100%', marginBottom: '24px' }}></div>

            <p className="text-sm font-semibold tracking-wide text-gray-400" style={{ marginBottom: '24px' }}>Ultimos meses</p>

            <div className="flex justify-between items-end flex-1" style={{ minHeight: '160px' }}>
              {/* Bars */}
              {[
                { label: 'Febrero', value: 10000, max: 24000 },
                { label: 'Marzo', value: 18000, max: 24000 },
                { label: 'Abril', value: 22000, max: 24000 },
                { label: 'Mayo', value: 20000, max: 24000 },
                { label: 'Actual', value: 24000, max: 24000 },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                  <span className="text-[10px] font-semibold text-gray-300 opacity-90 group-hover:opacity-100 transition-opacity" style={{ marginBottom: '8px' }}>
                    {item.label === 'Abril' ? '12,000' : item.value.toLocaleString()}
                  </span>
                  <div
                    className="bg-gradient-to-t from-[#FFC107]/40 to-[#FFC107] border border-[#FFC107]/50 rounded-t-lg group-hover:to-yellow-300 group-hover:-translate-y-1 transition-all shadow-[0_0_10px_rgba(255,193,7,0.2)]"
                    style={{
                      width: '60%',
                      maxWidth: '40px',
                      height: `${(item.value / item.max) * 110}px`
                    }}
                  ></div>
                  <span className="text-[10px] font-semibold text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" style={{ marginTop: '8px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clientes Section */}
        <div className="flex-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Clientes</h2>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-white flex flex-row items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-[calc(100%-44px)]" style={{ padding: '32px 24px', gap: '32px' }}>

            {/* Doughnut Chart Mock */}
            <div className="relative flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer" style={{ width: '130px', height: '130px' }}>
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(255,193,7,0.2)]"
                style={{
                  background: 'conic-gradient(#8b5cf6 0deg 200deg, #FFC107 200deg 270deg, #ef4444 270deg 300deg, #8b5cf6 300deg 360deg)'
                }}>
              </div>
              <div className="absolute bg-[#141a27] rounded-full" style={{ width: '80px', height: '80px' }}></div>
            </div>

            <div className="flex flex-col justify-center" style={{ gap: '16px' }}>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Activos</p>
                <p className="text-xl font-extrabold tracking-tight text-[#8b5cf6] group-hover:scale-110 transition-transform origin-left" style={{ lineHeight: '1', marginTop: '4px' }}>40</p>
              </div>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Por vencer</p>
                <p className="text-xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]" style={{ lineHeight: '1', marginTop: '4px' }}>12</p>
              </div>
              <div className="flex flex-col items-center sm:items-start group cursor-pointer">
                <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Vencidos</p>
                <p className="text-xl font-extrabold tracking-tight text-red-400 group-hover:scale-110 transition-transform origin-left drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]" style={{ lineHeight: '1', marginTop: '4px' }}>5</p>
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
            <Dumbbell size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <p className="text-4xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]" style={{ marginBottom: '12px' }}>32</p>
            <div className="flex items-center text-xs font-semibold text-gray-400">
              <Wrench size={14} style={{ marginRight: '6px' }} /> 1 en mantenimiento
            </div>
          </div>

          <div className="flex flex-col items-center text-center border-l border-white/10 group cursor-pointer hover:bg-white/5 rounded-xl transition-colors" style={{ padding: '16px 8px' }}>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors" style={{ marginBottom: '16px' }}>Productos</p>
            <Package size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <p className="text-4xl font-extrabold tracking-tight text-[#FFC107] group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]" style={{ marginBottom: '12px' }}>50</p>
            <div className="flex items-center text-xs font-semibold text-gray-400">
              <AlertTriangle size={14} className="text-[#FFC107]" style={{ marginRight: '6px' }} /> 3 con bajo stock
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
