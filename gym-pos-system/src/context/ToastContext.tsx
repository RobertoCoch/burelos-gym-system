import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [activeToast, setActiveToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setActiveToast({ id, message, type });
    
    // Pequeño retraso para que React monte el toast antes de disparar la transición
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setIsVisible(false); // Comienza la animación de salida (sube)
      
      // Esperar a que la animación termine (500ms) antes de sacarlo del DOM
      setTimeout(() => {
        setActiveToast((current) => {
          if (current?.id === id) return null;
          return current;
        });
      }, 500);
    }, 3000);
  }, []);

  const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none
          ${isVisible ? 'top-6 md:top-8 opacity-100' : '-top-20 opacity-0'}
        `}
      >
        {activeToast && (
          <div 
            className={`
              flex items-center gap-3 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-xl border
              ${activeToast.type === 'success' ? 'bg-[#10B981]/20 border-[#10B981]/30 text-[#10B981]' : ''}
              ${activeToast.type === 'error' ? 'bg-[#EF4444]/20 border-[#EF4444]/30 text-[#EF4444]' : ''}
              ${activeToast.type === 'info' ? 'bg-[#3B82F6]/20 border-[#3B82F6]/30 text-[#3B82F6]' : ''}
            `}
          >
            {activeToast.type === 'success' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {activeToast.type === 'error' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {activeToast.type === 'info' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-extrabold text-sm md:text-base text-white tracking-wide">
              {activeToast.message}
            </span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
