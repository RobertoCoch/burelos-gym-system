import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Edit, Loader2, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import UserFormModal from './UserFormModal';
import UserDetailsPanel from './UserDetailsPanel';
import pb from '../../../lib/pocketbase';

export default function UsersView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Vencidos'>('Todos');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce para la búsqueda (2 caracteres mínimo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Consultar usuarios reales de PocketBase
  const { data: usersData, isLoading: loadingUsers, isError } = useQuery({
    queryKey: ['users', sortOrder],
    queryFn: async () => {
      return await pb.collection('users').getFullList({
        sort: sortOrder === 'newest' ? '-created' : '+created',
      });
    },
  });

  // Consultar todas las membresías activas para enlazarlas con los usuarios
  const { data: membershipsData, isLoading: loadingMemberships } = useQuery({
    queryKey: ['membresias', 'todas'],
    queryFn: async () => {
      try {
        return await pb.collection('membresias_activas').getFullList({ expand: 'plan' });
      } catch (err) {
        return [];
      }
    },
  });

  const membershipMap = useMemo(() => {
    const map = new Map<string, any>();
    if (membershipsData) {
      membershipsData.forEach(m => {
        map.set(m.usuario, m);
      });
    }
    return map;
  }, [membershipsData]);

  const isLoading = loadingUsers || loadingMemberships;

  const handleOpenDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const handleOpenAdd = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  // Filtrado local
  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    
    return usersData.filter(user => {
      // 1. Filtro por búsqueda (nombre o correo)
      let matchesSearch = true;
      if (debouncedSearch.length >= 2) {
        const searchLower = debouncedSearch.toLowerCase();
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        matchesSearch = !!(nameMatch || emailMatch);
      }
        
      // 2. Filtro por estado (Todos, Activos, Vencidos)
      let matchesStatus = true;
      const mem = membershipMap.get(user.id);
      
      if (statusFilter === 'Activos') {
        matchesStatus = !!mem && mem.estado === 'activa';
      } else if (statusFilter === 'Vencidos') {
        matchesStatus = !!mem && mem.estado === 'vencida';
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [usersData, debouncedSearch, statusFilter, membershipMap]);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div className="flex justify-center" style={{ padding: '0 24px', marginBottom: '24px', marginTop: '24px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">
          Usuarios
        </h1>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4" style={{ padding: '0 24px', marginBottom: '24px' }}>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#FFC107] hover:bg-[#ffca28] text-black font-bold py-2.5 px-6 rounded-xl transition-colors shadow-[0_4px_14px_rgba(255,193,7,0.39)] active:scale-95 shrink-0"
        >
          Agregar +
        </button>
        
        <div className="flex flex-1 flex-wrap items-center md:justify-end gap-3">
          
          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-white/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC107]/50 transition-colors backdrop-blur-md"
            />
          </div>

          {/* Ordenar */}
          <button 
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-xl transition-all active:scale-95 backdrop-blur-md text-sm"
            title="Ordenar por fecha"
          >
            <ArrowUpDown size={16} />
            <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Más nuevos' : 'Más antiguos'}</span>
          </button>

          {/* Dropdown Filtro */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-xl transition-all active:scale-95 backdrop-blur-md text-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">{statusFilter}</span>
              <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-xl">
                  {['Todos', 'Activos', 'Vencidos'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as any);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5
                        ${statusFilter === status ? 'text-[#FFC107] font-bold bg-white/5' : 'text-white/80 font-medium'}
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Users List Section */}
      <div className="flex-1 flex flex-col" style={{ padding: '0 24px' }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-[#FFC107]" size={40} />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-12 font-bold">
            Error al cargar los usuarios.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-white/50 py-12 font-bold">
            {usersData?.length === 0 
              ? 'No hay usuarios registrados aún.' 
              : 'No se encontraron resultados para los filtros aplicados.'}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '12px' }}>
            {filteredUsers.map((user) => {
              const mem = membershipMap.get(user.id);
              const planName = mem?.expand?.plan?.nombre || 'Sin asignar';
              const isExpired = mem?.estado === 'vencida';
              const statusText = mem ? (isExpired ? 'Vencido' : 'Activo') : 'Sin asignar';
              const statusColor = mem ? (isExpired ? 'text-red-500' : 'text-[#22c55e]') : 'text-gray-400';

              return (
                <div key={user.id} className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors" style={{ padding: '16px' }}>
                  <div className="flex flex-col">
                    <span className="text-[#FFC107] font-bold text-sm md:text-base drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]">
                      {user.name || user.email}
                    </span>
                    <span className="text-white/80 font-medium text-xs md:text-sm">
                      {planName}
                    </span>
                    {mem && (
                      <span className={`font-bold text-xs md:text-sm mt-1 ${statusColor}`}>
                        {statusText}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleOpenDetails(user.id)}
                      className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-[#ffca28] text-black font-bold py-1.5 px-3 text-xs sm:text-sm rounded-lg transition-colors shadow-sm active:scale-95"
                    >
                      <Edit size={14} strokeWidth={2.5} /> Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={userToEdit}
      />
      
      <UserDetailsPanel
        userId={selectedUserId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditUser}
      />
    </div>
  );
}
