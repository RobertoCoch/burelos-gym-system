import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeneficiosModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  beneficiosHtml: string;
}

export default function BeneficiosModal({ isOpen, onClose, planName, beneficiosHtml }: BeneficiosModalProps) {
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing && !isMounted) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col max-h-[85vh]
          ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Beneficios del <span className="text-[#FFC107] drop-shadow-[0_0_10px_rgba(255,193,7,0.3)]">{planName}</span>
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent text-white/90">
          {beneficiosHtml && beneficiosHtml.trim() !== '' ? (
            <div 
              className="prose prose-invert prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-[#FFC107] prose-strong:font-extrabold prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5 space-y-2 text-[15px] md:text-base max-w-none"
              dangerouslySetInnerHTML={{ __html: beneficiosHtml }}
            />
          ) : (
            <div className="text-center py-8 text-white/40 italic">
              Este plan no tiene beneficios detallados aún.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-black/20 shrink-0 flex justify-end">
          <button 
            onClick={handleClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
