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
  imagen: string; // URL o filename
  cantidad_total: number;
  cantidad_mantenimiento: number;
  tipo: EquipmentType;
  musculo_objetivo: TargetMuscle;
  created?: string;
  updated?: string;
}
