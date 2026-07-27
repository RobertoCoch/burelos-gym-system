import React, { useState } from 'react';
import { MoreVertical, Edit2, Wrench, Trash2 } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment';
import pb from '../../../../lib/pocketbase';
import ConfirmModal from '../../../../components/shared/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

export default function EquipmentCard({ equipment, onEdit, onDeleteSuccess }: EquipmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();

  const imageUrl = equipment.imagen 
    ? pb.files.getURL(equipment as any, equipment.imagen, { thumb: '200x200' })
    : null;

  const disponibles = equipment.cantidad_total - equipment.cantidad_mantenimiento;

  const handleDelete = async () => {
    try {
      await pb.collection('equipo_gym').delete(equipment.id);
      toast.success('Equipo eliminado correctamente');
      onDeleteSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al eliminar el equipo');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Peso Libre': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Máquina Guiada': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Poleas': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Cardio': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Funcional': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const closeMenuAndDo = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  return (
    <>
      <div className="bg-[#1C2031] border border-white/5 rounded-2xl p-4 shadow-lg flex items-center gap-4 relative transition-all hover:bg-[#1f2438]">
        
        {/* Imagen */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-2">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={equipment.nombre} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center font-bold">
              SIN<br/>IMAGEN
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3 className="text-[#FFC107] font-extrabold text-base sm:text-lg mb-1 truncate drop-shadow-sm">
            {equipment.nombre}
          </h3>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {equipment.tipo && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTipoColor(equipment.tipo)}`}>
                {equipment.tipo}
              </span>
            )}
            {equipment.musculo_objetivo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-white/5 text-gray-300 border-white/10">
                {equipment.musculo_objetivo}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-white font-bold text-xs sm:text-sm">
              Disponibles: <span className="text-gray-300 font-medium">{disponibles} equipos</span>
            </span>
            {equipment.cantidad_mantenimiento > 0 && (
              <span className="text-red-400 font-bold text-xs mt-0.5 animate-pulse">
                ({equipment.cantidad_mantenimiento} en mantenimiento)
              </span>
            )}
          </div>
        </div>

        {/* Menu 3 Puntos */}
        <div className="shrink-0 relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors active:scale-95"
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1F2E] border border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button 
                  onClick={() => closeMenuAndDo(onEdit)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <Edit2 size={16} className="text-gray-400" />
                  Editar
                </button>
                <button 
                  onClick={() => closeMenuAndDo(onEdit)} // Por ahora redirige a editar para cambiar cantidad de mantenimiento
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <Wrench size={16} className="text-gray-400" />
                  Mantenimiento
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button 
                  onClick={() => closeMenuAndDo(() => setIsConfirmOpen(true))}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar Equipo"
        message={`¿Estás seguro que deseas eliminar "${equipment.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
