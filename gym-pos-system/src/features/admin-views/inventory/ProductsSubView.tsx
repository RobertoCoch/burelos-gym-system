import React, { useState } from 'react';
import { ArrowLeft, Edit, Search, Filter, Loader2, Image as ImageIcon, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import pb from '../../../lib/pocketbase';
import ProductFormModal from './ProductFormModal';

interface ProductsSubViewProps {
  onBack: () => void;
}

export default function ProductsSubView({ onBack }: ProductsSubViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSort, setStockSort] = useState<'none' | 'desc' | 'asc'>('none');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  // 1. Fetch de productos
  const { data: productos, isLoading, isError } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      try {
        return await pb.collection('productos').getFullList({
          sort: '-created',
        });
      } catch (err: any) {
        if (err.status === 404) return []; // Si la colección no existe o está vacía
        throw err;
      }
    },
  });

  // Filtrado local y ordenamiento
  const filteredProducts = productos?.filter(prod => {
    return prod.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    if (stockSort === 'asc') return a.stock - b.stock;
    if (stockSort === 'desc') return b.stock - a.stock;
    return 0; // Orden por defecto (fecha creación por la query original)
  }) || [];

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
          Tus <span className="text-[#FFC107]">Productos</span>
        </h1>
      </div>

      {/* Agregar Botón */}
      <div className="px-6 mb-6">
        <button 
          onClick={() => {
            setProductToEdit(null);
            setIsFormOpen(true);
          }}
          className="w-full bg-[#FFC107] hover:bg-[#ffca28] text-black font-extrabold py-3 px-6 rounded-2xl transition-transform active:scale-95 shadow-[0_4px_14px_0_rgba(255,193,7,0.39)] flex justify-center items-center"
        >
          Agregar +
        </button>
      </div>

      {/* Buscador y Filtro */}
      <div className="flex px-6 gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full bg-transparent border border-white/20 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder-gray-500"
          />
        </div>
        
        <div className="relative shrink-0">
          <select 
            value={stockSort}
            onChange={(e) => setStockSort(e.target.value as any)}
            className="flex items-center justify-center gap-2 pl-4 pr-10 py-2.5 bg-transparent border border-white/20 rounded-full text-sm font-bold text-white hover:bg-white/5 transition-colors appearance-none cursor-pointer focus:outline-none focus:border-[#FFC107]/50"
          >
            <option value="none" className="bg-[#1A1F2E] text-white">Filtro...</option>
            <option value="desc" className="bg-[#1A1F2E] text-white">Mayor stock</option>
            <option value="asc" className="bg-[#1A1F2E] text-white">Menor stock</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
            <Filter size={16} />
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="flex flex-col px-6 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#FFC107] mb-4" size={40} />
            <p className="text-white/60 font-medium">Cargando productos...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-bold">No se pudieron cargar los productos.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/5 border border-white/10 rounded-[24px] text-center px-4">
            <Package size={64} className="text-white/20 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-white mb-2">Sin productos</h3>
            <p className="text-gray-400 text-sm max-w-[250px]">
              {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Aún no hay productos registrados en tu inventario.'}
            </p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const imageUrl = prod.imagen 
              ? pb.files.getURL(prod, prod.imagen, { thumb: '100x100' }) 
              : null;

            return (
              <div 
                key={prod.id} 
                className="relative bg-[#1A1F2E]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex gap-4 shadow-lg hover:bg-[#1A1F2E] transition-colors"
              >
                {/* Imagen */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white rounded-xl p-1 flex items-center justify-center shadow-inner overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={prod.nombre}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div>
                    <h3 className="text-[#FFC107] font-extrabold text-sm sm:text-base leading-tight pr-10 drop-shadow-sm">
                      {prod.nombre}
                    </h3>
                    <div className="mt-2 flex flex-col">
                      <span className="text-white font-bold text-[11px] sm:text-xs">Stock</span>
                      <span className="text-gray-400 text-[11px] sm:text-xs">{prod.stock} pzas</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[#FFC107] font-extrabold text-sm sm:text-base">
                      $ {prod.precio?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} MXN
                    </span>
                  </div>
                </div>

                {/* Botón Editar */}
                <button 
                  onClick={() => {
                    setProductToEdit(prod);
                    setIsFormOpen(true);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-[#FFC107] hover:bg-[#ffca28] rounded-full flex items-center justify-center text-black transition-transform active:scale-95 shadow-md"
                >
                  <Edit size={14} strokeWidth={2.5} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <ProductFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
      />
    </div>
  );
}
