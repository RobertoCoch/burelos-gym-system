import React, { useState } from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import AddPlanModal from './AddPlanModal';

interface PlansSubViewProps {
  onBack: () => void;
}

const mockPlans = [
  { id: 1, nombre: 'Plan Basico', duracion: 'Mensual', precio: 300, beneficios: 'Beneficios' },
  { id: 2, nombre: 'Plan Intermedio', duracion: 'Mensual', precio: 400, beneficios: 'Beneficios' },
  { id: 3, nombre: 'Plan Burelos', duracion: 'Mensual', precio: 500, beneficios: 'Beneficios' },
  { id: 4, nombre: 'Plan Semanal', duracion: 'Semanal', precio: 250, beneficios: 'Beneficios' },
];

export default function PlansSubView({ onBack }: PlansSubViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white pb-24">
      {/* Header */}
      <div className="flex items-center p-6 md:p-8 relative min-h-[100px]">
        <button 
          onClick={onBack}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft size={28} className="text-white" strokeWidth={2.5} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Tus <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Planes</span>
          </h1>
        </div>
      </div>

      <div className="px-6 md:px-8 max-w-3xl lg:max-w-none mx-auto w-full flex flex-col gap-6 lg:px-12">
        <div className="flex lg:justify-start">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-2.5 px-5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(255,193,7,0.3)] text-sm flex items-center gap-1"
          >
            Agregar <span className="text-lg leading-none">+</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:items-start">
          {mockPlans.map(plan => (
            <div key={plan.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between group">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#FFC107]">{plan.nombre}</h3>
                <p className="text-sm text-white/60">{plan.duracion}</p>
                <button className="mt-1 text-[13px] sm:text-sm font-bold text-white/90 flex items-center gap-1.5 hover:text-white transition-colors w-fit">
                  {plan.beneficios} <span className="text-[10px] opacity-70">▶</span>
                </button>
              </div>
              
              <div className="flex flex-col items-end justify-between h-full gap-4">
                <button className="w-10 h-10 rounded-full bg-[#FFC107] hover:bg-[#FFD54F] flex items-center justify-center text-black transition-all active:scale-95 shadow-[0_0_10px_rgba(255,193,7,0.3)]">
                  <Edit2 size={18} strokeWidth={2.5} />
                </button>
                <span className="text-base sm:text-lg font-bold text-[#FFC107] tracking-tight">$ {plan.precio} MXN</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddPlanModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
