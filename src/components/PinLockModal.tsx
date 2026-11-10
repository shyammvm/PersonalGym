import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PinLockModalProps {
  correctPin: string;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    triggerHaptic('light');
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        triggerHaptic('success');
        onUnlock();
      } else {
        triggerHaptic('error');
        setErrorShake(true);
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-gym-950 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="w-16 h-16 rounded-3xl bg-gym-900 border border-gym-800 flex items-center justify-center text-emerald-400 mb-6 shadow-xl">
        <Lock size={32} />
      </div>

      <h2 className="text-xl font-black tracking-tight mb-2">IronTrack Locked</h2>
      <p className="text-xs text-slate-400 mb-8">Enter your 4-digit PIN to access your workouts</p>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-10 ${errorShake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > i
                ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_#10b981]'
                : 'bg-gym-800 border border-gym-700'
            }`}
          />
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="w-18 h-18 py-4 rounded-2xl bg-gym-900/90 hover:bg-gym-800 border border-gym-800/80 active:scale-95 text-xl font-bold font-mono transition shadow-sm"
          >
            {d}
          </button>
        ))}

        <div />
        <button
          onClick={() => handleDigit('0')}
          className="w-18 h-18 py-4 rounded-2xl bg-gym-900/90 hover:bg-gym-800 border border-gym-800/80 active:scale-95 text-xl font-bold font-mono transition shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-18 h-18 py-4 rounded-2xl bg-gym-900/40 hover:bg-gym-800 text-slate-400 hover:text-white active:scale-95 flex items-center justify-center transition"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
};

