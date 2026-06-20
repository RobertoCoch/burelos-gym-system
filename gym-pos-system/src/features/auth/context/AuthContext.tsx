import React, { createContext, useState, useEffect, ReactNode } from 'react';
import pb from '../../../lib/pocketbase';

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    role: string | null;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Inicializar el estado usando el authStore actual (si recargamos la página, pb recordará la sesión si es válida)
    const [user, setUser] = useState<any | null>(pb.authStore.model);

    useEffect(() => {
        // Nos suscribimos a cualquier cambio en la sesión (por ejemplo cuando se llama a authWithPassword o clear)
        const unsubscribe = pb.authStore.onChange((token, model) => {
            setUser(model);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const logout = () => {
        pb.authStore.clear();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: pb.authStore.isValid,
            role: user?.role || null,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
