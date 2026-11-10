import React, { useState } from 'react';
import { BookOpen, Search, Plus, Trophy, Trash2, X } from 'lucide-react';
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

  const handleDeleteCustom = (id: string) => {
    if (confirm('Delete this custom exercise?')) {
      triggerHaptic('warning');
      gymStorage.deleteCustomExercise(id);
      setExercises(exercises.filter(e => e.id !== id));
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Exercises <BookOpen size={22} className="text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400">Library & Personal Records (PRs)</p>
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
              className="bg-gym-900/90 border border-gym-800 p-3.5 rounded-2xl flex items-center justify-between"
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
                    <span className="text-[10px] text-slate-500">
                      (Est 1RM: {pr.oneRepMax}{unit})
                    </span>
                  </div>
                ) : (
                  <span className="block text-[10px] text-slate-600 mt-1">No logs yet</span>
                )}
              </div>

              {ex.is_custom && (
                <button
                  onClick={() => handleDeleteCustom(ex.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition"
                  title="Delete custom exercise"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

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
