import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Loader2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../../lib/pocketbase';
import type { Equipment } from '../../../../types/equipment';
import EquipmentCard from './EquipmentCard';
import EquipmentFormModal from './EquipmentFormModal';

interface EquipmentSubViewProps {
  onBack: () => void;
}

export default function EquipmentSubView({ onBack }: EquipmentSubViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);

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

  // Filtrado local
  const filteredEquipment = equipmentList?.filter(eq => {
    return eq.nombre.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
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
      <div className="px-6 flex gap-3 mb-8">
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
        <button 
          className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-full flex items-center justify-center transition-colors active:scale-95 font-bold text-sm text-gray-300 gap-2"
        >
          Filtrar
        </button>
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
          <p className="text-gray-500 text-sm text-center">No se encontraron equipos que coincidan con tu búsqueda.</p>
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
