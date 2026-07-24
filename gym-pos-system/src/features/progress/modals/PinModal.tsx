import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { getDailyPIN } from '../../../utils/attendance';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPin(['', '', '', '']);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    // Take just the last character if they pasted or typed fast
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check PIN if all 4 are filled
    if (index === 3 && value !== '' && newPin.every(v => v !== '')) {
      validatePin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePin = (enteredPin: string) => {
    const dailyPin = getDailyPIN();
    
    if (enteredPin === dailyPin) {
      onSuccess();
    } else {
      setError(true);
      // Shake effect and clear
      setTimeout(() => {
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-[#1C2031] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8 mt-2">
          <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Registrar Asistencia</h3>
          <p className="text-gray-400 text-sm">
            Ingresa el código de 4 dígitos mostrado en el mostrador del gimnasio.
          </p>
        </div>

        <div className={`flex justify-center gap-3 md:gap-4 mb-8 ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 md:w-16 md:h-20 bg-black/30 border-2 rounded-2xl text-center text-3xl font-extrabold text-white focus:outline-none transition-all
                ${error 
                  ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : digit 
                    ? 'border-[#FFC107] shadow-[0_0_10px_rgba(255,193,7,0.2)]' 
                    : 'border-white/10 focus:border-white/30'
                }
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-center font-semibold mb-4 animate-in fade-in slide-in-from-bottom-2">
            Código incorrecto
          </p>
        )}

        <button 
          onClick={onClose}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
