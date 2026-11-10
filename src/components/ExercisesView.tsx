import React, { useState } from 'react';
import { BookOpen, Search, Plus, Trophy, Trash2, X, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Exercise, MuscleGroup, EquipmentType } from '../types';
import { gymStorage } from '../services/storage';
import { triggerHaptic } from '../utils/haptics';

interface ExercisesViewProps {
  unit: 'kg' | 'lbs';
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({ unit }) => {
  const [exercises, setExercises] = useState<Exercise[]>(gymStorage.getExercises());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  // New exercise form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('Chest');
  const [newEquipment, setNewEquipment] = useState<EquipmentType>('Barbell');
  const [newRest, setNewRest] = useState(90);

  const muscleFilters = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || e.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    triggerHaptic('success');
    const created = gymStorage.addCustomExercise({
      name: newName.trim(),
      muscle_group: newMuscle,
      equipment: newEquipment,
      default_rest_seconds: newRest,
    });

    setExercises([...exercises, created]);
    setNewName('');
    setIsAddOpen(false);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this custom exercise?')) {
      triggerHaptic('warning');
      gymStorage.deleteCustomExercise(id);
      setExercises(exercises.filter(ex => ex.id !== id));
      if (selectedEx?.id === id) {
        setSelectedEx(null);
      }
    }
  };

  // Helper to render SVG line graph for progression
  const renderProgressionGraph = (history: ReturnType<typeof gymStorage.getExerciseHistory>) => {
    if (history.length === 0) return null;

    if (history.length === 1) {
      return (
        <div className="bg-gym-950/60 p-4 rounded-2xl border border-gym-800 text-center my-3">
          <p className="text-xs text-slate-400">1 session logged ({history[0].maxWeight}{unit} × {history[0].repsAtMax}).</p>
          <span className="text-sm font-bold text-emerald-400">Est 1RM: {history[0].estimated1RM}{unit}</span>
        </div>
      );
    }

    const max1RM = Math.max(...history.map(h => h.estimated1RM));
    const min1RM = Math.min(...history.map(h => h.estimated1RM));
    const range = Math.max(1, max1RM - min1RM);
    const width = 320;
    const height = 120;
    const padding = 20;

    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.estimated1RM - min1RM) / range) * (height - 2 * padding);
      return { x, y, ...h };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="bg-gym-950/80 p-4 rounded-2xl border border-gym-800 my-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <TrendingUp size={14} className="text-emerald-400" /> Estimated 1RM Progression
          </span>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            +{Math.max(0, points[points.length - 1].estimated1RM - points[0].estimated1RM)}{unit}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#progGrad)" />
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-gym-950 stroke-emerald-400 stroke-2"
            />
          ))}
        </svg>

        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>{new Date(history[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span>{new Date(history[history.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Exercises <BookOpen size={22} className="text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400">Tap any exercise for 1RM charts & PR stats</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-gym-950 font-bold rounded-xl active:scale-95 transition flex items-center gap-1 text-xs"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search 30+ exercises..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gym-900 border border-gym-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Muscle Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
        {muscleFilters.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedMuscle === m
                ? 'bg-emerald-500 text-gym-950 font-bold'
                : 'bg-gym-900 border border-gym-800 text-slate-400 hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="space-y-2.5">
        {filtered.map(ex => {
          const pr = gymStorage.getExercisePR(ex.id);
          return (
            <div
              key={ex.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedEx(ex);
              }}
              className="bg-gym-900/90 border border-gym-800 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                  {ex.is_custom && (
                    <span className="text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                      Custom
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {ex.muscle_group} • {ex.equipment} • {ex.default_rest_seconds}s rest
                </span>

                {/* PR Badge */}
                {pr ? (
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="flex items-center gap-1 font-bold text-yellow-400">
                      <Trophy size={12} /> PR: {pr.weight}{unit} × {pr.reps}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (1RM: {pr.oneRepMax}{unit})
                    </span>
                  </div>
                ) : (
                  <span className="block text-[10px] text-slate-600 mt-1">Tap to view progression</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {ex.is_custom && (
                  <button
                    onClick={(e) => handleDeleteCustom(ex.id, e)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition"
                    title="Delete custom exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <ChevronRight size={18} className="text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail & 1RM Progression Modal */}
      {selectedEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4">
          <div className="bg-gym-900 border border-gym-700 w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
            {/* Modal Header */}
            <div className="p-4 border-b border-gym-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{selectedEx.name}</h3>
                <span className="text-xs text-slate-400">
                  {selectedEx.muscle_group} • {selectedEx.equipment}
                </span>
              </div>
              <button
                onClick={() => setSelectedEx(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Instructions if any */}
              {selectedEx.instructions && (
                <div className="bg-gym-950/50 p-3 rounded-xl border border-gym-800 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400 block mb-0.5">Technique Note:</span>
                  {selectedEx.instructions}
                </div>
              )}

              {/* PR / Lifetime Stats Cards */}
              {(() => {
                const pr = gymStorage.getExercisePR(selectedEx.id);
                const history = gymStorage.getExerciseHistory(selectedEx.id);
                const totalLifetimeSets = history.reduce((sum, h) => sum + h.sets.length, 0);
                const totalLifetimeVolume = history.reduce((sum, h) => sum + h.totalVolume, 0);

                return (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-gym-950 p-3 rounded-2xl border border-yellow-500/30">
                        <span className="text-[10px] uppercase font-bold text-yellow-400 block">Personal Record</span>
                        <div className="text-lg font-black text-white font-mono mt-0.5">
                          {pr ? `${pr.weight}${unit} × ${pr.reps}` : 'None'}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {pr ? `Est. 1RM: ${pr.oneRepMax}${unit}` : 'Log sets to establish PR'}
                        </span>
                      </div>

                      <div className="bg-gym-950 p-3 rounded-2xl border border-emerald-500/30">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Volume</span>
                        <div className="text-lg font-black text-white font-mono mt-0.5">
                          {totalLifetimeVolume.toLocaleString()} {unit}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Across {totalLifetimeSets} sets
                        </span>
                      </div>
                    </div>

                    {/* Progression Graph */}
                    {renderProgressionGraph(history)}

                    {/* Past Workout Sessions for this exercise */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-400" /> Logged Sessions ({history.length})
                      </h4>

                      {history.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 bg-gym-950/40 rounded-xl">
                          No logged sets yet for this exercise.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {[...history].reverse().map((h, idx) => (
                            <div key={idx} className="bg-gym-950/80 p-3 rounded-xl border border-gym-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-emerald-400">
                                  {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[11px] font-mono text-slate-300">
                                  Vol: {h.totalVolume.toLocaleString()}{unit}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {h.sets.map((s, sIdx) => (
                                  <span key={sIdx} className="text-[10px] bg-gym-800 px-2 py-0.5 rounded text-slate-200 font-mono">
                                    {s.weight}{unit} × {s.reps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-3 border-t border-gym-800 bg-gym-950/40">
              <button
                onClick={() => setSelectedEx(null)}
                className="w-full py-2.5 bg-gym-800 hover:bg-gym-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleCreateExercise}
            className="bg-gym-900 border border-gym-700 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">New Exercise</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Cable Fly"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Muscle Group
                  </label>
                  <select
                    value={newMuscle}
                    onChange={e => setNewMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-gym-950 border border-gym-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    {muscleFilters.filter(m => m !== 'All').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Equipment
                  </label>
                  <select
                    value={newEquipment}
                    onChange={e => setNewEquipment(e.target.value as EquipmentType)}
                    className="w-full bg-gym-950 border border-gym-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Cable">Cable</option>
                    <option value="Machine">Machine</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Default Rest Timer (seconds)
                </label>
                <input
                  type="number"
                  min="15"
                  max="600"
                  step="15"
                  value={newRest}
                  onChange={e => setNewRest(Number(e.target.value))}
                  className="w-full bg-gym-950 border border-gym-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gym-950 font-bold rounded-xl text-sm transition"
            >
              Save Exercise
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
