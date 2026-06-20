import { Filter, Edit } from 'lucide-react';

export default function UsersView() {
  // Mock data for UI design
  const users = [
    { id: 1, name: 'José Roberto Contreras Chablé', plan: 'Plan Basico', status: 'Activo' },
    { id: 2, name: 'Jairo Alejandro', plan: 'Plan Burelos', status: 'Activo' },
    { id: 3, name: 'Diego', plan: 'Plan Basico', status: 'Vencido' },
    { id: 4, name: 'Alejandro', plan: 'Plan Semanal', status: 'Activo' },
  ];

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div className="flex justify-center" style={{ padding: '0 24px', marginBottom: '24px', marginTop: '24px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">
          Usuarios
        </h1>
      </div>

      {/* Actions Section */}
      <div className="flex justify-between items-center" style={{ padding: '0 24px', marginBottom: '24px' }}>
        <button className="bg-[#FFC107] hover:bg-[#ffca28] text-black font-bold py-2 px-6 rounded-full transition-colors shadow-[0_4px_14px_rgba(255,193,7,0.39)] active:scale-95">
          Agregar +
        </button>
        <button className="flex items-center gap-2 bg-transparent border border-white/30 hover:bg-white/10 text-white font-semibold py-2 px-6 rounded-full transition-all active:scale-95 backdrop-blur-md">
          Filtrar <Filter size={18} />
        </button>
      </div>

      {/* Users List Section */}
      <div className="flex-1 flex flex-col" style={{ padding: '0 24px' }}>
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors" style={{ padding: '16px' }}>
              <div className="flex flex-col">
                <span className="text-[#FFC107] font-bold text-sm md:text-base drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]">{user.name}</span>
                <span className="text-gray-400 font-medium text-xs md:text-sm">{user.plan}</span>
                <span className="text-white font-bold text-xs md:text-sm mt-1">{user.status}</span>
              </div>
              <div className="flex items-center">
                <button className="flex items-center gap-2 bg-[#FFC107] hover:bg-[#ffca28] text-black font-bold py-1.5 px-4 rounded-xl transition-colors shadow-sm active:scale-95">
                  <Edit size={16} /> Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
