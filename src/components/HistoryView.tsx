import React, { useState } from 'react';
import { Calendar, Clock, Dumbbell, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Workout } from '../types';

interface HistoryViewProps {
  workouts: Workout[];
  unit: 'kg' | 'lbs';
  onDeleteWorkout: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  workouts,
  unit,
  onDeleteWorkout,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedWorkouts = workouts.filter(w => w.is_completed);

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (secs: number) => {
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Workout History <Calendar size={22} className="text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400">
            {completedWorkouts.length} logged sessions in your journey
          </p>
        </div>
      </div>

      {completedWorkouts.length === 0 ? (
        <div className="bg-gym-900/60 border border-gym-800 rounded-3xl p-8 text-center mt-6">
          <div className="w-16 h-16 rounded-2xl bg-gym-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Dumbbell size={32} />
          </div>
          <h3 className="font-bold text-white text-base mb-1">No Workouts Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Hit the &ldquo;Workout&rdquo; tab and log your first gym session to see your history and progression!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {completedWorkouts.map(w => {
            const isExpanded = expandedId === w.id;
            const completedSets = w.sets.filter(s => s.is_completed);

            // Group sets by exercise
            const exerciseMap: { [name: string]: typeof completedSets } = {};
            completedSets.forEach(s => {
              if (!exerciseMap[s.exercise_name]) {
                exerciseMap[s.exercise_name] = [];
              }
              exerciseMap[s.exercise_name].push(s);
            });

            return (
              <div
                key={w.id}
                className="bg-gym-900/90 border border-gym-800 hover:border-gym-700 rounded-2xl overflow-hidden shadow-sm transition"
              >
                {/* Summary Card Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : w.id)}
                  className="p-4 cursor-pointer active:bg-gym-850/50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {formatDate(w.start_time)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm('Delete this workout from history?')) {
                            onDeleteWorkout(w.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mb-2">{w.name}</h3>

                  {/* Summary Metric Chips */}
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {formatDuration(w.duration_seconds || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell size={13} className="text-teal-400" />
                      {(w.total_volume_kg || 0).toLocaleString()} {unit}
                    </span>
                    <span className="text-slate-400">
                      {completedSets.length} sets
                    </span>
                  </div>

                  {w.notes && (
                    <p className="mt-2 text-xs text-slate-400 flex items-start gap-1.5 italic">
                      <FileText size={12} className="shrink-0 mt-0.5" />
                      &ldquo;{w.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gym-800/60 bg-gym-950/40 space-y-3">
                    {Object.keys(exerciseMap).map(exName => (
                      <div key={exName} className="bg-gym-900/60 p-3 rounded-xl border border-gym-800/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-white text-xs">{exName}</h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {exerciseMap[exName].length} sets
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {exerciseMap[exName].map((set, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-gym-800 text-slate-200 px-2 py-0.5 rounded-md font-mono"
                            >
                              {set.weight}{unit} × {set.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
