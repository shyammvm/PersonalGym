import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Plus, Minus, Timer, Volume2, VolumeX } from 'lucide-react';
import { gymAudio } from '../utils/audio';
import { triggerHaptic, notifyRestTimerDone } from '../utils/haptics';

interface RestTimerProps {
  initialSeconds: number;
  exerciseName?: string;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  onFinish: () => void;
  onClose: () => void;
}

export const RestTimerFloating: React.FC<RestTimerProps> = ({
  initialSeconds,
  exerciseName,
  soundEnabled,
  vibrateEnabled,
  onFinish,
  onClose,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [muted, setMuted] = useState(!soundEnabled);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      if (!muted) {
        gymAudio.playRestCompleteChime();
      }
      if (vibrateEnabled) {
        triggerHaptic('success');
      }
      notifyRestTimerDone(exerciseName);
      onFinish();
      return;
    }

    // Audible tick for 3, 2, 1 seconds remaining
    if (secondsLeft <= 3 && secondsLeft > 0 && !muted) {
      gymAudio.playWarningTick();
      if (vibrateEnabled) {
        triggerHaptic('light');
      }
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, muted, vibrateEnabled, exerciseName, onFinish]);

  const addTime = (delta: number) => {
    triggerHaptic('light');
    setSecondsLeft(prev => {
      const updated = Math.max(0, prev + delta);
      setTotalSeconds(Math.max(totalSeconds, updated));
      return updated;
    });
  };

  const toggleRunning = () => {
    triggerHaptic('medium');
    setIsRunning(prev => !prev);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 100;

  return (
    <div
      className={`fixed left-4 right-4 z-50 transition-all duration-300 ease-out ${
        isExpanded ? 'bottom-20 max-w-sm mx-auto' : 'bottom-[76px] max-w-md mx-auto'
      }`}
    >
      <div className="bg-gym-900/95 border border-emerald-500/40 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden p-3 transition-all">
        {/* Progress bar line */}
        <div className="w-full bg-gym-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#10b981]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon & Time */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 cursor-pointer flex-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Timer size={20} className={isRunning ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Rest
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                {exerciseName ? exerciseName : 'Next Set Ready Soon'}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addTime(30)}
              className="px-2 py-1 text-xs font-semibold bg-gym-800 hover:bg-gym-700 text-slate-200 rounded-lg active:scale-95 transition"
              title="Add 30 seconds"
            >
              +30s
            </button>
            <button
              onClick={toggleRunning}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white active:scale-95 transition ${
                isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gym-800/80 hover:bg-gym-700 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition"
              title="Skip / Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gym-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => addTime(-15)}
                className="p-1.5 bg-gym-800 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1"
              >
                <Minus size={14} /> 15s
              </button>
              <button
                onClick={() => addTime(15)}
                className="p-1.5 bg-gym-800 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1"
              >
                <Plus size={14} /> 15s
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="p-1.5 bg-gym-800 rounded-lg text-slate-400 hover:text-white"
                title="Toggle Sound"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
              </button>
              <button
                onClick={onFinish}
                className="px-3 py-1 bg-emerald-500 text-gym-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
              >
                Ready Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

