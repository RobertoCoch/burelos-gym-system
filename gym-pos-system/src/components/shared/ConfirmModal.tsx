import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Continuar', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onCancel();
    }, 300);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onConfirm();
    }, 300);
  };

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleCancel}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col
          ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        `}
      >
        <div className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] mb-2">
            <AlertCircle size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-white/70 text-[15px]">{message}</p>
        </div>
        
        <div className="p-4 sm:p-6 border-t border-white/5 bg-black/20 shrink-0 flex justify-end gap-3 w-full">
          <button 
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)] cursor-pointer active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
