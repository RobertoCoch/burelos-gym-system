import React, { useState } from 'react';
import { MoreVertical, Edit2, Wrench, Trash2, ChevronDown, ChevronUp, QrCode, Printer, Plus, Minus } from 'lucide-react';
import type { Equipment, EquipmentUnit } from '../../../../types/equipment';
import pb from '../../../../lib/pocketbase';
import ConfirmModal from '../../../../components/shared/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: () => void;
  onDeleteSuccess: () => void;
}

export default function EquipmentCard({ equipment, onEdit, onDeleteSuccess }: EquipmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [qrUnit, setQrUnit] = useState<EquipmentUnit | null>(null);
  
  // States for adding / deleting units
  const [unitToDelete, setUnitToDelete] = useState<EquipmentUnit | null>(null);
  const [isAddUnitsOpen, setIsAddUnitsOpen] = useState(false);
  const [unitsToAdd, setUnitsToAdd] = useState(1);
  
  const toast = useToast();
  const queryClient = useQueryClient();

  const imageUrl = equipment.imagen 
    ? pb.files.getURL(equipment as any, equipment.imagen, { thumb: '200x200' })
    : null;

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['equipo_unidades', equipment.id],
    queryFn: async () => {
      return (await pb.collection('equipo_unidades').getFullList({
        filter: `equipo_id = "${equipment.id}"`,
        sort: 'codigo_referencia'
      })) as unknown as EquipmentUnit[];
    },
    enabled: isExpanded
  });

  const operativos = units.length > 0
    ? units.filter(u => u.estado === 'Operativo').length
    : equipment.cantidad_total - equipment.cantidad_mantenimiento;
    
  const mantenimiento = units.length > 0
    ? units.filter(u => u.estado === 'Mantenimiento').length
    : equipment.cantidad_mantenimiento;

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

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    try {
      await pb.collection('equipo_unidades').delete(unitToDelete.id);
      
      const isMantenimiento = unitToDelete.estado === 'Mantenimiento';
      const newTotal = Math.max(0, equipment.cantidad_total - 1);
      const newMantenimiento = isMantenimiento 
        ? Math.max(0, equipment.cantidad_mantenimiento - 1)
        : equipment.cantidad_mantenimiento;

      await pb.collection('equipo_gym').update(equipment.id, {
        cantidad_total: newTotal,
        cantidad_mantenimiento: newMantenimiento
      });

      queryClient.invalidateQueries({ queryKey: ['equipo_unidades', equipment.id] });
      queryClient.invalidateQueries({ queryKey: ['equipo_gym'] });
      toast.success(`Unidad ${unitToDelete.codigo_referencia} eliminada`);
      setUnitToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar unidad');
    }
  };

  const handleAddUnits = async () => {
    if (unitsToAdd < 1) return;
    try {
      let maxNumber = 0;
      units.forEach(u => {
        const parts = u.codigo_referencia.split('-');
        const num = parseInt(parts[parts.length - 1]);
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
      });

      for (let i = 1; i <= unitsToAdd; i++) {
        const nextNum = maxNumber + i;
        const ref = `${equipment.codigo_base}-${nextNum.toString().padStart(2, '0')}`;
        await pb.collection('equipo_unidades').create({
          equipo_id: equipment.id,
          codigo_referencia: ref,
          estado: 'Operativo'
        });
      }

      await pb.collection('equipo_gym').update(equipment.id, {
        cantidad_total: equipment.cantidad_total + unitsToAdd
      });

      queryClient.invalidateQueries({ queryKey: ['equipo_unidades', equipment.id] });
      queryClient.invalidateQueries({ queryKey: ['equipo_gym'] });
      toast.success(`${unitsToAdd} unidades agregadas exitosamente`);
      setIsAddUnitsOpen(false);
      setUnitsToAdd(1);
    } catch (err) {
      console.error(err);
      toast.error('Error al agregar nuevas unidades');
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

  const toggleUnitStatus = async (unit: EquipmentUnit) => {
    try {
      const newStatus = unit.estado === 'Operativo' ? 'Mantenimiento' : 'Operativo';
      await pb.collection('equipo_unidades').update(unit.id, { estado: newStatus });
      
      const newMantenimiento = newStatus === 'Mantenimiento' 
        ? equipment.cantidad_mantenimiento + 1 
        : Math.max(0, equipment.cantidad_mantenimiento - 1);
        
      await pb.collection('equipo_gym').update(equipment.id, { cantidad_mantenimiento: newMantenimiento });
      
      queryClient.invalidateQueries({ queryKey: ['equipo_unidades', equipment.id] });
      queryClient.invalidateQueries({ queryKey: ['equipo_gym'] });
      
      toast.success(`Unidad ${unit.codigo_referencia} marcada como ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar estado de la unidad');
    }
  };

  return (
    <>
      <div className="bg-[#1C2031] border border-white/5 rounded-2xl shadow-lg flex flex-col relative transition-all hover:bg-[#1f2438]">
        
        {/* Cabecera Principal */}
        <div className="p-4 flex items-center gap-4">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <span className="text-white font-bold text-xs sm:text-sm">
                Operativos: <span className="text-gray-300 font-medium">{operativos}</span>
              </span>
              {mantenimiento > 0 && (
                <span className="text-red-400 font-bold text-xs mt-0.5 sm:mt-0 animate-pulse flex items-center gap-1">
                  <Wrench size={12} /> {mantenimiento} reparación
                </span>
              )}
            </div>
          </div>

          {/* Menu 3 Puntos */}
          <div className="shrink-0 relative flex flex-col gap-2">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors active:scale-95"
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
                    Editar General
                  </button>
                  <div className="h-px bg-white/10 my-1"></div>
                  <button 
                    onClick={() => closeMenuAndDo(() => setIsConfirmOpen(true))}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                  >
                    <Trash2 size={16} />
                    Eliminar Todo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenedor inferior con overflow para respetar bordes redondeados */}
        <div className="overflow-hidden rounded-b-2xl">
          {/* Boton Desplegable */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-white/5 border-t border-white/5 py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isExpanded ? (
              <><ChevronUp size={16} /> Ocultar Unidades</>
            ) : (
              <><ChevronDown size={16} /> Ver Desglose de Unidades</>
            )}
          </button>

          {/* Sub-panel de Unidades */}
          {isExpanded && (
            <div className="bg-[#141824] border-t border-black/20 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-300">Unidades Registradas</h4>
                <button 
                  onClick={() => setIsAddUnitsOpen(true)}
                  className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Añadir Unidades
                </button>
              </div>

              {isLoadingUnits ? (
                <p className="text-gray-500 text-xs text-center animate-pulse py-4">Cargando unidades...</p>
              ) : units.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No hay unidades registradas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {units.map(unit => (
                    <div key={unit.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3 group">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white tracking-wider">
                          {unit.codigo_referencia}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${unit.estado === 'Operativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {unit.estado}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleUnitStatus(unit)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${unit.estado === 'Operativo' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}
                        >
                          {unit.estado === 'Operativo' ? 'Marcar Mantenimiento' : 'Marcar Operativo'}
                        </button>
                        <button 
                          onClick={() => setQrUnit(unit)}
                          className="w-10 h-10 bg-white/10 hover:bg-[#FFC107] hover:text-black text-white rounded-lg flex items-center justify-center transition-colors border border-white/10"
                          title="Ver Código QR"
                        >
                          <QrCode size={16} />
                        </button>
                        <button 
                          onClick={() => setUnitToDelete(unit)}
                          className="w-10 h-10 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg flex items-center justify-center transition-colors border border-transparent hover:border-red-500/20"
                          title="Eliminar Unidad"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar Equipo Completo"
        message={`¿Estás seguro que deseas eliminar "${equipment.nombre}" y TODAS sus unidades? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar todo"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={!!unitToDelete}
        title="Eliminar Unidad"
        message={`¿Estás seguro que deseas eliminar permanentemente la unidad "${unitToDelete?.codigo_referencia}"?`}
        confirmText="Sí, eliminar"
        onConfirm={handleDeleteUnit}
        onCancel={() => setUnitToDelete(null)}
      />

      {/* Modal Agregar Unidades */}
      {isAddUnitsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1F2E] rounded-3xl p-6 max-w-sm w-full flex flex-col relative animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-extrabold text-white mb-2">Añadir Unidades</h2>
            <p className="text-gray-400 text-sm mb-6">Agrega más unidades de "{equipment.nombre}". Los códigos de referencia se generarán automáticamente.</p>
            
            <div className="flex items-center w-full bg-[#141824] border border-white/5 rounded-2xl p-2 shadow-inner mb-6">
              <button 
                onClick={() => setUnitsToAdd(p => Math.max(1, p - 1))}
                className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
              >
                <Minus size={20} strokeWidth={3} />
              </button>
              <input
                type="number"
                value={unitsToAdd}
                onChange={(e) => setUnitsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-transparent text-center text-3xl font-extrabold text-[#FFC107] focus:outline-none min-w-0"
              />
              <button 
                onClick={() => setUnitsToAdd(p => p + 1)}
                className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-md"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsAddUnitsOpen(false); setUnitsToAdd(1); }}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddUnits}
                className="flex-[2] px-4 py-3 bg-[#FFC107] hover:bg-[#FFD54F] text-black rounded-xl font-extrabold transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,193,7,0.3)]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de QR */}
      {qrUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setQrUnit(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors font-bold"
            >
              ×
            </button>
            
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">{equipment.nombre}</h2>
            <p className="text-gray-500 font-mono text-sm mb-6">{qrUnit.codigo_referencia}</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-gray-100 mb-6">
              <QRCodeSVG 
                value={qrUnit.codigo_referencia} 
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
              />
            </div>
            
            <button 
              onClick={() => window.print()}
              className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      )}
    </>
  );
}
