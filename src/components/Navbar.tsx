import React from 'react';
import { Dumbbell, Flame, Calendar, BookOpen, Settings } from 'lucide-react';

export type TabType = 'workout' | 'streaks' | 'history' | 'exercises' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveWorkout: boolean;
  currentStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveWorkout,
  currentStreak
}) => {
  const tabs = [
    {
      id: 'workout' as TabType,
      label: 'Workout',
      icon: Dumbbell,
      badge: hasActiveWorkout ? 'Active' : undefined
    },
    {
      id: 'streaks' as TabType,
      label: 'Streaks',
      icon: Flame,
      badge: currentStreak > 0 ? `${currentStreak}` : undefined
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: Calendar
    },
    {
      id: 'exercises' as TabType,
      label: 'Exercises',
      icon: BookOpen
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gym-900/90 backdrop-blur-xl border-t border-gym-800 pb-[env(safe-area-inset-bottom,12px)] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                      tab.id === 'workout'
                        ? 'bg-emerald-500 text-gym-950 animate-pulse'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

