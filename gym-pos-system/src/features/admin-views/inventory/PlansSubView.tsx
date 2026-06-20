import React, { useState } from 'react';
import { ArrowLeft, Edit2, Eye, Archive, ArchiveRestore, LayoutList } from 'lucide-react';
import PlanFormModal from './PlanFormModal';
import { useGetPlanes, type Plan } from './api/planes.services';
import type { Plan as PlanType } from './api/planes.services';
import BeneficiosModal from '../../../components/shared/BeneficiosModal';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import pb from '../../../lib/pocketbase';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../context/ToastContext';

interface PlansSubViewProps {
  onBack: () => void;
}

export default function PlansSubView({ onBack }: PlansSubViewProps) {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<PlanType | null>(null);

  const [isBeneficiosModalOpen, setIsBeneficiosModalOpen] = useState(false);
  const [selectedPlanForBenefits, setSelectedPlanForBenefits] = useState<PlanType | null>(null);

  const [showArchived, setShowArchived] = useState(false);
  const { data: planes, isLoading, isError } = useGetPlanes(showArchived);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    plan: PlanType | null;
  }>({ isOpen: false, plan: null });

  const queryClient = useQueryClient();
  const toast = useToast();

  const togglePlanStatus = async (plan: PlanType) => {
    try {
      await pb.collection('planes').update(plan.id, { activo: !plan.activo });
      queryClient.invalidateQueries({ queryKey: ['planes'] });
      toast.success(plan.activo ? 'Plan archivado' : 'Plan restaurado exitosamente');
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cambiar el estado del plan');
    }
  };

  const handleToggleClick = (plan: PlanType) => {
    setConfirmModalState({ isOpen: true, plan });
  };

  const confirmToggle = () => {
    if (confirmModalState.plan) {
      togglePlanStatus(confirmModalState.plan);
    }
    setConfirmModalState({ isOpen: false, plan: null });
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white pb-24">
      {/* Header */}
      <div className="flex items-center p-6 md:p-8 relative min-h-[100px]">
        <button
          onClick={onBack}
          className="p-2 bg-transparent hover:bg-white/10 rounded-full transition-all active:scale-95 z-10 cursor-pointer"
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
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => { setSelectedPlanToEdit(null); setIsPlanModalOpen(true); }}
            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-2.5 px-5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(255,193,7,0.3)] text-sm flex items-center gap-1 cursor-pointer"
          >
            Agregar <span className="text-lg leading-none">+</span>
          </button>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className="bg-transparent border border-white/20 hover:border-white/40 text-white/80 font-bold py-2 px-4 rounded-full transition-all active:scale-95 text-sm flex items-center gap-2 cursor-pointer"
          >
            {showArchived ? (
              <><LayoutList size={16} /> Activos</>
            ) : (
              <><Archive size={16} /> Archivados</>
            )}
          </button>
        </div>

        {/* Estados de carga y error */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-[#FFC107]/30 border-t-[#FFC107] rounded-full animate-spin shadow-[0_0_15px_rgba(255,193,7,0.3)]"></div>
          </div>
        )}

        {isError && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-6 text-center">
            <p className="text-[#EF4444] font-bold">Error al cargar los planes. Revisa tu conexión.</p>
          </div>
        )}

        {!isLoading && !isError && (!planes || planes.length === 0) && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
            <p className="text-white/50 text-lg font-bold">
              {showArchived ? 'No tienes planes archivados.' : 'Aún no tienes planes registrados.'}
            </p>
            {!showArchived && <p className="text-white/30 text-sm">Haz clic en Agregar para crear tu primer plan.</p>}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:items-start">
          {planes?.map(plan => (
            <div key={plan.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between group">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#FFC107]">{plan.nombre}</h3>
                <p className="text-sm text-white/60 capitalize">{plan.tipo_duracion}</p>
                <button
                  onClick={() => { setSelectedPlanForBenefits(plan); setIsBeneficiosModalOpen(true); }}
                  className="mt-1 text-[13px] sm:text-sm font-bold text-white/90 flex items-center gap-1.5 hover:text-[#FFC107] transition-colors w-fit cursor-pointer"
                >
                  <Eye size={15} /> Ver beneficios
                </button>
              </div>

              <div className="flex flex-col items-end justify-between h-full gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleClick(plan)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/80 transition-all active:scale-95 cursor-pointer"
                    title={plan.activo ? "Archivar" : "Restaurar"}
                  >
                    {plan.activo ? <Archive size={16} strokeWidth={2.5} /> : <ArchiveRestore size={16} strokeWidth={2.5} />}
                  </button>
                  <button
                    onClick={() => { setSelectedPlanToEdit(plan); setIsPlanModalOpen(true); }}
                    className="w-10 h-10 rounded-full bg-[#FFC107] hover:bg-[#FFD54F] flex items-center justify-center text-black transition-all active:scale-95 shadow-[0_0_10px_rgba(255,193,7,0.3)] cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#FFC107] tracking-tight">$ {plan.precio.toFixed(2)} MXN</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PlanFormModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        planToEdit={selectedPlanToEdit}
      />

      <BeneficiosModal 
        isOpen={isBeneficiosModalOpen}
        onClose={() => setIsBeneficiosModalOpen(false)}
        planName={selectedPlanForBenefits?.nombre || ''}
        beneficiosHtml={selectedPlanForBenefits?.beneficios || ''}
      />

      <ConfirmModal 
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.plan?.activo ? "¿Deseas archivar este plan?" : "¿Deseas restaurar este plan?"}
        message={confirmModalState.plan?.activo ? "El plan ya no estará visible para la venta." : "El plan volverá a estar disponible."}
        confirmText="Continuar"
        onConfirm={confirmToggle}
        onCancel={() => setConfirmModalState({ isOpen: false, plan: null })}
      />
    </div>
  );
}
