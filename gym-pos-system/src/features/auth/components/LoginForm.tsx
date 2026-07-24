import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gymIcon from '../../../assets/burelos-gym-icon.png';
import { authServices } from '../api/auth.services';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    // Efecto de entrada al montar el componente
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const authData = await authServices.loginWithEmail(email, password);
            const role = authData.record.role;
            if (role === 'admin') {
                toast.success('Sesión iniciada correctamente');
                navigate('/admin/dashboard');
            } else if (role === 'client') {
                toast.success('Sesión iniciada correctamente');
                navigate('/client/perfil');
            } else {
                setError('Rol no reconocido.');
            }
        } catch (err: any) {
            setError('Credenciales inválidas o error en el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1C2031] to-[#0A0D14] flex justify-center items-center font-sans relative overflow-hidden selection:bg-[#FFC107] selection:text-black"
            style={{ padding: '1.5rem' }}
        >
            {/* Efectos de luz modernos de fondo */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#FFC107]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FFC107]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div 
                className={`w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between z-10 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ gap: '3rem' }}
            >
                {/* Lado Izquierdo: Logo y Textos (50%) */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="w-48 h-48 lg:w-64 lg:h-64" style={{ marginBottom: '1rem' }}>
                        <img
                            src={gymIcon}
                            alt="Burelos Gym Logo"
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <h1 className="flex flex-col" style={{ marginBottom: '1rem' }}>
                        <span className="text-3xl lg:text-4xl font-extrabold text-white/90 tracking-tight" style={{ marginBottom: '0.25rem' }}>
                            Bienvenido a
                        </span>
                        <span className="text-5xl lg:text-7xl font-extrabold text-[#FFC107] tracking-tight drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]" style={{ paddingBottom: '0.5rem' }}>
                            BURELOS GYM
                        </span>
                    </h1>
                    <p className="text-gray-400 font-medium text-lg lg:text-xl max-w-md tracking-wide">
                        Gestiona tus rutinas, membresía y progreso
                    </p>
                </div>

                {/* Lado Derecho: Formulario (50%) */}
                <div className="w-full max-w-md lg:w-1/2">
                    <div 
                        className="bg-white/5 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 hover:border-white/20 transition-colors duration-500"
                        style={{ padding: '2.5rem' }}
                    >
                        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ marginBottom: '0.5rem' }}>Iniciar Sesión</h2>
                        <p className="text-gray-400 font-medium text-sm" style={{ marginBottom: '2rem' }}>
                            Ingresa tus credenciales para acceder
                        </p>

                        {error && (
                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400 text-sm font-bold" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label className="block text-white/90 font-bold text-xs uppercase tracking-wider" style={{ marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#FFC107]/50 focus:ring-1 focus:ring-[#FFC107]/50 transition-all placeholder:text-gray-500 font-medium text-base shadow-inner backdrop-blur-md"
                                    style={{ padding: '1rem 1.25rem' }}
                                />
                            </div>

                            <div>
                                <label className="block text-white/90 font-bold text-xs uppercase tracking-wider" style={{ marginBottom: '0.5rem', marginLeft: '0.25rem' }}>
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#FFC107]/50 focus:ring-1 focus:ring-[#FFC107]/50 transition-all placeholder:text-gray-500 font-medium text-base shadow-inner backdrop-blur-md"
                                        style={{ padding: '1rem 3rem 1rem 1.25rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ paddingTop: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center bg-[#FFC107]/20 hover:bg-[#FFC107]/30 border border-[#FFC107]/30 text-[#FFC107] font-extrabold tracking-tight text-lg rounded-2xl transition-all shadow-[0_0_15px_rgba(255,193,7,0.15)] hover:shadow-[0_0_25px_rgba(255,193,7,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
                                    style={{ padding: '1rem 0' }}
                                >
                                    {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
