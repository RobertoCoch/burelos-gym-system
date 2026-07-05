import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav, { type NavItem } from '../components/navigation/BottomNav';
import { User, Dumbbell, TrendingUp } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import pb from '../lib/pocketbase';
import UserDetailsPanel from '../features/admin-views/users/UserDetailsPanel';
import UserFormModal from '../features/admin-views/users/UserFormModal';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const currentUser = pb.authStore.model;

  // Helpers para iniciales y colores
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const stringToColor = (str: string) => {
    if (!str) return '#1A1F2E';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const avatarUrl = currentUser?.avatar 
    ? pb.files.getURL(currentUser, currentUser.avatar, { thumb: '100x100' })
    : null;

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
        style={{ padding: '12px 24px 12px 24px' }}
      >
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center hover:bg-white/5 p-1 -ml-1 rounded-xl transition-colors active:scale-95 text-left min-w-0"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="rounded-full object-cover shadow-inner border border-white/20 shrink-0"
              style={{ width: '40px', height: '40px', marginRight: '12px' }}
            />
          ) : (
            <div 
              className="rounded-full flex items-center justify-center shadow-inner border border-white/20 shrink-0"
              style={{ width: '40px', height: '40px', marginRight: '12px', backgroundColor: stringToColor(currentUser?.id || '') }}
            >
              <span className="text-base sm:text-lg font-extrabold text-white drop-shadow-md">
                {getInitials(currentUser?.name || currentUser?.email || '')}
              </span>
            </div>
          )}
          <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white drop-shadow-sm truncate max-w-[130px] sm:max-w-[200px]">
            {currentUser?.name || currentUser?.email || 'Usuario'}
          </span>
        </button>
        <div
          className="flex items-center font-bold text-xs sm:text-sm text-gray-400 bg-white/5 border border-white/10 rounded-xl select-none shrink-0 ml-2"
          style={{ padding: '6px 12px' }}
        >
          <span>Beta 1.0</span>
        </div>
      </header>

      {/* Outlet renderiza el componente hijo de la ruta actual */}
      <main className="container mx-auto w-full h-full px-4 pt-6">
        <Outlet />
      </main>

      <BottomNav items={clientNavItems} />

      <UserDetailsPanel 
        userId={currentUser?.id || null}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onEdit={() => setIsEditProfileOpen(true)}
        slideFrom="left"
        isCurrentUser={true}
        onLogout={handleLogout}
      />

      <UserFormModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userToEdit={currentUser}
      />
    </div>
  );
}
