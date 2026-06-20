import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRole: string;
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (role !== allowedRole) {
        // Redirect to correct dashboard based on role
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'client') return <Navigate to="/client/perfil" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};
