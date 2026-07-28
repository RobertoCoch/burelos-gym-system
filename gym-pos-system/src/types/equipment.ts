export type EquipmentType = 
  | 'Peso Libre'
  | 'Máquina Guiada'
  | 'Poleas'
  | 'Cardio'
  | 'Funcional';

export type TargetMuscle = 
  | 'Pecho'
  | 'Espalda'
  | 'Pierna'
  | 'Brazo'
  | 'Hombro'
  | 'Full Body';

export interface Equipment {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo_base?: string;
  cantidad_total: number;
  cantidad_mantenimiento: number;
  tipo: EquipmentType;
  musculo_objetivo: TargetMuscle;
  imagen?: string; // Nombre del archivo subido
  created: string;
  updated: string;
}

export type EquipmentUnitStatus = 'Operativo' | 'Mantenimiento' | 'Baja';

export interface EquipmentUnit {
  id: string;
  equipo_id: string; // Relación con Equipment.id
  codigo_referencia: string; // Ej. "MG-01-01"
  estado: EquipmentUnitStatus;
  created: string;
  updated: string;
}
