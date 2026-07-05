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
    <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1C2031] to-[#0A0D14] text-white pb-24 font-sans selection:bg-[#FFC107] selection:text-black">
      {/* Header Superior */}
      <header className="sticky top-0 z-40 bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">Mi Perfil</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl transition-all active:scale-95"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">SALIR</span>
        </button>
      </header>

      <main className="container mx-auto w-full h-full px-4 pt-6">
        <Outlet />
      </main>

      <BottomNav items={clientNavItems} />
    </div>
  );
}
