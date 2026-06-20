import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav, { type NavItem } from '../components/navigation/BottomNav';
import { User, Dumbbell, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

const clientNavItems: NavItem[] = [
  {
    label: 'Perfil',
    path: '/client/perfil',
    icon: <User size={24} strokeWidth={2.5} />,
  },
  {
    label: 'Rutinas',
    path: '/client/routines',
    icon: <Dumbbell size={24} strokeWidth={2.5} />,
  },
  {
    label: 'Progreso',
    path: '/client/progress',
    icon: <TrendingUp size={24} strokeWidth={2.5} />,
  },
];

export default function ClientLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Superior */}
      <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-xl font-bold text-slate-800">Mi Perfil</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>SALIR</span>
        </button>
      </header>

      <main className="container mx-auto w-full h-full px-4 pt-6">
        <Outlet />
      </main>

      <BottomNav items={clientNavItems} />
    </div>
  );
}
