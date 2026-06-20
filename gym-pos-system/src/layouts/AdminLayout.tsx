import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav, { type NavItem } from '../components/navigation/BottomNav';
import { Home, CreditCard, Package, Users, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';

const adminNavItems: NavItem[] = [
  {
    label: 'Inicio',
    path: '/admin/dashboard',
    icon: <Home size={24} strokeWidth={2.5} />,
  },
  {
    label: 'Pago',
    path: '/admin/payments',
    icon: <CreditCard size={24} strokeWidth={2.5} />,
  },
  {
    label: 'Inventario',
    path: '/admin/inventory',
    icon: <Package size={24} strokeWidth={2.5} />,
  },
  {
    label: 'Usuarios',
    path: '/admin/users',
    icon: <Users size={24} strokeWidth={2.5} />,
  },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1C2031] to-[#0A0D14] text-white pb-24 font-sans selection:bg-[#FFC107] selection:text-black">
      {/* Header Superior */}
      <header 
        className={`sticky top-0 z-40 flex justify-between items-center transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'bg-[#111827]/70 backdrop-blur-lg border-b border-white/10 shadow-lg' 
            : 'bg-transparent'
        }`} 
        style={{ padding: '24px 24px 12px 24px' }}
      >
        <div className="flex items-center">
          <div className="bg-white/10 border border-white/20 rounded-full shadow-inner" style={{ width: '48px', height: '48px', marginRight: '16px' }}></div>
          <span className="font-extrabold tracking-tight text-xl text-white drop-shadow-sm">Administrador</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center font-bold text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all active:scale-95 backdrop-blur-md"
          style={{ padding: '8px 16px', gap: '8px' }}
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>SALIR</span>
        </button>
      </header>

      {/* Outlet renderiza el componente hijo de la ruta actual */}
      <main className="container mx-auto w-full h-full px-4 pt-6">
        <Outlet />
      </main>

      <BottomNav items={adminNavItems} />
    </div>
  );
}
