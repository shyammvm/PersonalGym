import React from 'react';
import { Flame, Trophy, Calendar, Zap, ShieldCheck } from 'lucide-react';
import { UserStreaks } from '../types';

interface StreaksViewProps {
  streaks: UserStreaks;
}

export const StreaksView: React.FC<StreaksViewProps> = ({ streaks }) => {
  // Generate days for past 12 weeks for GitHub-style heatmap
  const generateHeatmapDays = () => {
    const days: { dateStr: string; isActive: boolean; dayOfWeek: number }[] = [];
    const today = new Date();
    // 12 weeks = 84 days
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const isActive = streaks.active_dates.includes(dateStr);
      days.push({
        dateStr,
        isActive,
        dayOfWeek: d.getDay() // 0 = Sunday
      });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  // Milestone Badges
  const milestones = [
    { id: 'm1', days: 1, title: 'Iron Spark', desc: 'Completed your first gym session', icon: '⚡' },
    { id: 'm3', days: 3, title: 'Habit Builder', desc: '3 consecutive days active', icon: '🔥' },
    { id: 'm7', days: 7, title: 'Weekly Warrior', desc: '1 week streak achieved', icon: '🛡️' },
    { id: 'm14', days: 14, title: 'Iron Discipline', desc: '2 consecutive weeks strong', icon: '⚔️' },
    { id: 'm30', days: 30, title: 'Gym Beast', desc: '30-day streak legend', icon: '👑' },
    { id: 'm100', days: 100, title: 'Century Titan', desc: '100 days of dedication', icon: '🏆' },
  ];

  const highestStreak = Math.max(streaks.current_streak, streaks.longest_streak);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Gym Streaks <Flame size={24} className="text-orange-500 fill-orange-500" />
          </h1>
          <p className="text-xs text-slate-400">Consistency is the mother of all gains</p>
        </div>
      </div>

      {/* Hero Streak Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/20 via-gym-900 to-gym-950 border border-orange-500/30 p-6 mb-6 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Current Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                {streaks.current_streak}
              </span>
              <span className="text-lg font-bold text-orange-300">
                {streaks.current_streak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {streaks.current_streak > 0
                ? "Keep the momentum rolling! You're on fire."
                : "Complete a workout today to light the flame!"}
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]">
            <Flame size={44} className="fill-white animate-pulse" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-orange-500/20 text-center">
          <div className="bg-gym-950/60 p-2.5 rounded-xl border border-gym-800/80">
            <span className="block text-slate-400 text-[10px] uppercase font-semibold">Best Streak</span>
            <span className="text-lg font-black text-white font-mono">{streaks.longest_streak}d</span>
          </div>
          <div className="bg-gym-950/60 p-2.5 rounded-xl border border-gym-800/80">
            <span className="block text-slate-400 text-[10px] uppercase font-semibold">Total Logs</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{streaks.total_workouts}</span>
          </div>
          <div className="bg-gym-950/60 p-2.5 rounded-xl border border-gym-800/80">
            <span className="block text-slate-400 text-[10px] uppercase font-semibold">This Week</span>
            <span className="text-lg font-black text-orange-400 font-mono">{streaks.workouts_this_week}</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Calendar size={16} className="text-emerald-400" /> 12-Week Consistency Matrix
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {streaks.active_dates.length} active days
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 py-2 overflow-x-auto justify-start sm:justify-center">
          {heatmapDays.map((d, i) => (
            <div
              key={i}
              title={`${d.dateStr}: ${d.isActive ? 'Workout Completed!' : 'Rest Day'}`}
              className={`w-3.5 h-3.5 rounded-sm transition-all ${
                d.isActive
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                  : 'bg-gym-800/60 hover:bg-gym-800'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-gym-800">
          <span>Less Active</span>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-gym-800/60" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_4px_#10b981]" />
          </div>
          <span>More Active</span>
        </div>
      </div>

      {/* Milestone Badges */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Trophy size={16} className="text-yellow-400" /> Streak Milestones
          </h2>
          <span className="text-xs text-slate-400">
            {milestones.filter(m => highestStreak >= m.days).length}/{milestones.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {milestones.map(m => {
            const unlocked = highestStreak >= m.days;
            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-gym-850 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'bg-gym-950/40 border-gym-800/50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-tight">{m.title}</h3>
                    <span className="text-[10px] text-slate-400">{m.days} days</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {m.desc}
                </p>
                {unlocked && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <ShieldCheck size={12} /> UNLOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Tips */}
      <div className="bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/20 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Zap size={20} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Pro Tip:</strong> Don&rsquo;t fear rest days! Even taking 1-2 structured rest days per week preserves your consistency streak when logged as active recovery.
        </p>
      </div>
    </div>
  );
};
