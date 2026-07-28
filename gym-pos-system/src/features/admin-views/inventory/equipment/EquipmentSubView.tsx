import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Loader2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../../lib/pocketbase';
import type { Equipment } from '../../../../types/equipment';
import EquipmentCard from './EquipmentCard';
import EquipmentFormModal from './EquipmentFormModal';

interface EquipmentSubViewProps {
  onBack: () => void;
}

const TIPOS_EQUIPO = ['Peso Libre', 'Máquina Guiada', 'Poleas', 'Cardio', 'Funcional'];
const MUSCULOS = ['Full Body', 'Pecho', 'Espalda', 'Pierna', 'Brazo', 'Hombro'];

export default function EquipmentSubView({ onBack }: EquipmentSubViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pendingTypeFilters, setPendingTypeFilters] = useState<string[]>([]);
  const [pendingMuscleFilters, setPendingMuscleFilters] = useState<string[]>([]);
  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
  const [activeMuscleFilters, setActiveMuscleFilters] = useState<string[]>([]);
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);
  const [isMuscleExpanded, setIsMuscleExpanded] = useState(false);

  // 1. Fetch de equipo
  const { data: equipmentList, isLoading, isError, refetch } = useQuery({
    queryKey: ['equipo_gym'],
    queryFn: async () => {
      try {
        return (await pb.collection('equipo_gym').getFullList({
          sort: '-created',
        })) as unknown as Equipment[];
      } catch (err: any) {
        if (err.status === 404) return []; // Si la colección está vacía
        throw err;
      }
    },
  });

  // Filtrado
  const filteredEquipment = equipmentList?.filter(eq => {
    const matchesSearch = eq.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTypeFilters.length === 0 || (eq.tipo && activeTypeFilters.includes(eq.tipo));
    const matchesMuscle = activeMuscleFilters.length === 0 || (eq.musculo_objetivo && activeMuscleFilters.includes(eq.musculo_objetivo));
    return matchesSearch && matchesType && matchesMuscle;
  }) || [];

  const handleEdit = (eq: Equipment) => {
    setEquipmentToEdit(eq);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEquipmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const openFilter = () => {
    setPendingTypeFilters(activeTypeFilters);
    setPendingMuscleFilters(activeMuscleFilters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setActiveTypeFilters(pendingTypeFilters);
    setActiveMuscleFilters(pendingMuscleFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setPendingTypeFilters([]);
    setPendingMuscleFilters([]);
    setActiveTypeFilters([]);
    setActiveMuscleFilters([]);
    setIsFilterOpen(false);
  };

  const togglePendingType = (t: string) => {
    setPendingTypeFilters(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const togglePendingMuscle = (m: string) => {
    setPendingMuscleFilters(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const hasActiveFilters = activeTypeFilters.length > 0 || activeMuscleFilters.length > 0;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white relative" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div className="flex items-center gap-4 px-6 mb-6 mt-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft size={28} strokeWidth={2.5} className="text-white" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
          Tu <span className="text-[#FFC107]">Equipo</span>
        </h1>
      </div>

      {/* Agregar Botón */}
      <div className="px-6 mb-6">
        <button 
          onClick={handleAdd}
          className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-4 rounded-xl shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
        >
          Agregar +
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="px-6 flex gap-3 mb-8 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm md:text-base text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder:text-gray-500"
            placeholder="Buscar equipo..."
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={isFilterOpen ? () => setIsFilterOpen(false) : openFilter}
            className={`px-4 rounded-full flex items-center justify-center transition-colors active:scale-95 font-bold text-sm gap-2 h-full border ${
              hasActiveFilters 
                ? 'bg-[#FFC107]/20 border-[#FFC107]/50 text-[#FFC107]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Filter size={16} />
            {hasActiveFilters && (
              <span className="bg-[#FFC107] text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold">
                {activeTypeFilters.length + activeMuscleFilters.length}
              </span>
            )}
            Filtrar
          </button>

          {/* Menú Flotante de Filtros (Estilo Mercado Libre) */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
              <div className="absolute right-0 top-full mt-3 w-72 bg-[#1A1F2E] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgb(0,0,0,0.6)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-extrabold text-white text-base">Filtros</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white font-bold transition-colors">
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="p-4 overflow-y-auto max-h-[220px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* Categoría: Tipo */}
                  <div className="mb-2 border-b border-white/5 pb-3">
                    <button 
                      onClick={() => setIsTypeExpanded(!isTypeExpanded)}
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      <span>Tipo de Equipo</span>
                      {isTypeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isTypeExpanded && (
                      <div className="flex flex-col gap-2 mt-3">
                        {TIPOS_EQUIPO.map(tipo => {
                          const isSelected = pendingTypeFilters.includes(tipo);
                          return (
                            <div key={tipo} onClick={() => togglePendingType(tipo)} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FFC107] border-[#FFC107]' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                                {isSelected && <Check size={14} className="text-black" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                {tipo}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Categoría: Músculo */}
                  <div className="pt-2">
                    <button 
                      onClick={() => setIsMuscleExpanded(!isMuscleExpanded)}
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      <span>Músculo Objetivo</span>
                      {isMuscleExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isMuscleExpanded && (
                      <div className="flex flex-col gap-2 mt-3">
                        {MUSCULOS.map(musculo => {
                          const isSelected = pendingMuscleFilters.includes(musculo);
                          return (
                            <div key={musculo} onClick={() => togglePendingMuscle(musculo)} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FFC107] border-[#FFC107]' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                                {isSelected && <Check size={14} className="text-black" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                {musculo}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#141824] border-t border-black/20 flex gap-2">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="flex-1 py-2.5 rounded-xl bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold text-sm transition-colors shadow-lg"
                  >
                    Aplicar
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Estado de Carga */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <Loader2 size={40} className="text-[#FFC107] animate-spin mb-4" />
          <p className="text-gray-400 font-medium animate-pulse">Cargando inventario de equipo...</p>
        </div>
      )}

      {/* Estado de Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-red-500/10 rounded-2xl mx-6 border border-red-500/20">
          <p className="text-red-400 font-bold mb-2">Ocurrió un error</p>
          <p className="text-red-300/80 text-sm text-center">No se pudo cargar la lista de equipo. Por favor, intenta de nuevo.</p>
        </div>
      )}

      {/* Lista de Equipo */}
      {!isLoading && !isError && filteredEquipment.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 opacity-60">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <Search size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-300 font-bold text-lg mb-1">Sin resultados</p>
          <p className="text-gray-500 text-sm text-center">No se encontraron equipos que coincidan con tu búsqueda o filtros.</p>
        </div>
      )}

      {!isLoading && !isError && filteredEquipment.length > 0 && (
        <div className="px-6 flex flex-col gap-4">
          {filteredEquipment.map((eq) => (
            <EquipmentCard 
              key={eq.id} 
              equipment={eq} 
              onEdit={() => handleEdit(eq)} 
              onDeleteSuccess={handleSuccess}
            />
          ))}
        </div>
      )}

      {/* Modal de Formulario */}
      <EquipmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        equipmentToEdit={equipmentToEdit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
