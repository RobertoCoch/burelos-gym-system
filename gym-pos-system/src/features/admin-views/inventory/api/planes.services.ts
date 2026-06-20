import { useQuery } from '@tanstack/react-query';
import pb from '../../../../lib/pocketbase';

export interface Plan {
  id: string;
  nombre: string;
  tipo_duracion: string;
  precio: number;
  beneficios: string;
  activo: boolean;
  created: string;
  updated: string;
}

export const useGetPlanes = (showArchived: boolean = false) => {
  return useQuery({
    queryKey: ['planes', showArchived],
    queryFn: async () => {
      // getFullList trae todos los registros de una vez. Ideal para catálogos pequeños/medianos.
      const records = await pb.collection('planes').getFullList<Plan>({
        sort: '-created', // Ordenar por los más nuevos primero
        filter: `activo = ${showArchived ? 'false' : 'true'}`
      });
      return records;
    },
  });
};
