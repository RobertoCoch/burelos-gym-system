import React, { useState } from 'react';
import { Dumbbell, Package, ClipboardList, Activity } from 'lucide-react';
import PlansSubView from './PlansSubView';

export default function InventoryView() {
  const [currentSubView, setCurrentSubView] = useState<'none' | 'planes'>('none');

  if (currentSubView === 'planes') {
    return <PlansSubView onBack={() => setCurrentSubView('none')} />;
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: '32px', marginTop: '24px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          Sección de<br/>
          <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Inventario</span>
        </h1>
      </div>

      {/* Grid Section */}
      <div style={{ padding: '0 24px' }}>
        <div className="grid grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:gap-4" style={{ gap: '16px' }}>
          <button 
            onClick={() => setCurrentSubView('planes')}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group aspect-square lg:aspect-auto lg:h-32 lg:flex-1">
            <p className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-2">Planes</p>
            <ClipboardList size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
          
          <button 
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group aspect-square lg:aspect-auto lg:h-32 lg:flex-1">
            <p className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-2">Productos</p>
            <Package size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
          
          <button 
            disabled
            className="relative flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] aspect-square lg:aspect-auto lg:h-32 lg:flex-1 opacity-50 cursor-not-allowed">
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white border border-white/20">En desarrollo</div>
            <p className="text-base sm:text-lg font-bold text-white mb-4 lg:mb-2">Equipo</p>
            <Dumbbell size={48} className="text-white drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
          
          <button 
            disabled
            className="relative flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] aspect-square lg:aspect-auto lg:h-32 lg:flex-1 opacity-50 cursor-not-allowed">
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white border border-white/20">En desarrollo</div>
            <p className="text-base sm:text-lg font-bold text-white mb-4 lg:mb-2">Rutinas</p>
            <Activity size={48} className="text-white drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
        </div>
      </div>

    </div>
  );
}
