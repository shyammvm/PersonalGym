import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, Trash2, Clock, Dumbbell, Award, 
  ChevronRight, Calculator, X, Search, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Workout, WorkoutSet, Exercise, SetType, WorkoutTemplate } from '../types';
import { gymStorage } from '../services/storage';
import { gymAudio } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';

interface ActiveWorkoutViewProps {
  workout: Workout | null;
  unit: 'kg' | 'lbs';
  autoStartTimer: boolean;
  onUpdateWorkout: (workout: Workout) => void;
  onFinishWorkout: (workout: Workout) => void;
  onDiscardWorkout: () => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  workout,
  unit,
  autoStartTimer,
  onUpdateWorkout,
  onFinishWorkout,
  onDiscardWorkout,
  onStartRestTimer,
}) => {
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Plate calculator modal state
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [targetWeight, setTargetWeight] = useState(100);
  const [barWeight] = useState(20);

  useEffect(() => {
    setExercisesList(gymStorage.getExercises());
  }, []);

  // Live timer for active workout
  useEffect(() => {
    if (!workout) return;

    const start = new Date(workout.start_time).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };
    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [workout?.start_time, workout]);

  const formatDuration = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h}h ${m < 10 ? '0' : ''}${m}m`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Group workout sets by exercise
  const exerciseGroups: { exercise_id: string; exercise_name: string; sets: WorkoutSet[] }[] = [];
  if (workout) {
    workout.sets.forEach(s => {
      let group = exerciseGroups.find(g => g.exercise_id === s.exercise_id);
      if (!group) {
        group = { exercise_id: s.exercise_id, exercise_name: s.exercise_name, sets: [] };
        exerciseGroups.push(group);
      }
      group.sets.push(s);
    });
  }

  // Calculate live volume
  const totalVolume = workout
    ? workout.sets
        .filter(s => s.is_completed)
        .reduce((sum, s) => sum + s.weight * s.reps, 0)
    : 0;

  // Start new empty workout
  const handleStartEmpty = () => {
    triggerHaptic('medium');
    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      name: 'Gym Workout',
      start_time: new Date().toISOString(),
      duration_seconds: 0,
      notes: '',
      total_volume_kg: 0,
      is_completed: false,
      sets: []
    };
    onUpdateWorkout(newWorkout);
  };

  // Start workout from template
  const handleStartTemplate = (template: WorkoutTemplate) => {
    triggerHaptic('heavy');
    const allExercises = gymStorage.getExercises();
    const sets: WorkoutSet[] = [];

    template.exercises.forEach(te => {
      const exObj = allExercises.find(e => e.id === te.exercise_id);
      const exName = exObj ? exObj.name : 'Exercise';
      const prev = gymStorage.getLastPerformance(te.exercise_id);

      for (let s = 1; s <= te.target_sets; s++) {
        sets.push({
          id: `s-${Date.now()}-${te.exercise_id}-${s}`,
          exercise_id: te.exercise_id,
          exercise_name: exName,
          set_number: s,
          set_type: 'normal',
          weight: prev?.weight || 0,
          reps: prev?.reps || te.target_reps,
          rest_seconds: te.rest_seconds,
          is_completed: false
        });
      }
    });

    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      name: template.name,
      start_time: new Date().toISOString(),
      duration_seconds: 0,
      notes: '',
      total_volume_kg: 0,
      is_completed: false,
      sets
    };
    onUpdateWorkout(newWorkout);
  };

  // Add exercise to active workout
  const handleSelectExercise = (exercise: Exercise) => {
    if (!workout) return;
    triggerHaptic('light');

    const prev = gymStorage.getLastPerformance(exercise.id);
    const newSet: WorkoutSet = {
      id: `s-${Date.now()}`,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      set_number: 1,
      set_type: 'normal',
      weight: prev?.weight || 0,
      reps: prev?.reps || 10,
      rest_seconds: exercise.default_rest_seconds || 90,
      is_completed: false
    };

    const updated = {
      ...workout,
      sets: [...workout.sets, newSet]
    };
    onUpdateWorkout(updated);
    setIsAddExerciseOpen(false);
  };

  // Add another set for existing exercise
  const handleAddSet = (exerciseId: string, exerciseName: string) => {
    if (!workout) return;
    triggerHaptic('light');

    const existingSets = workout.sets.filter(s => s.exercise_id === exerciseId);
    const lastSet = existingSets[existingSets.length - 1];

    const newSet: WorkoutSet = {
      id: `s-${Date.now()}-${existingSets.length + 1}`,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      set_number: existingSets.length + 1,
      set_type: lastSet ? lastSet.set_type : 'normal',
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      rest_seconds: lastSet ? lastSet.rest_seconds : 90,
      is_completed: false
    };

    onUpdateWorkout({
      ...workout,
      sets: [...workout.sets, newSet]
    });
  };

  // Toggle set completion
  const handleToggleSet = (setId: string) => {
    if (!workout) return;

    const setObj = workout.sets.find(s => s.id === setId);
    if (!setObj) return;

    const willBeCompleted = !setObj.is_completed;
    triggerHaptic(willBeCompleted ? 'medium' : 'light');

    if (willBeCompleted) {
      gymAudio.playWarningTick();
      if (autoStartTimer) {
        onStartRestTimer(setObj.rest_seconds || 90, setObj.exercise_name);
      }
    }

    const updatedSets = workout.sets.map(s => {
      if (s.id === setId) {
        return {
          ...s,
          is_completed: willBeCompleted,
          completed_at: willBeCompleted ? new Date().toISOString() : undefined
        };
      }
      return s;
    });

    onUpdateWorkout({
      ...workout,
      sets: updatedSets
    });
  };

  // Update set weight / reps / type
  const handleUpdateSetValue = (setId: string, fields: Partial<WorkoutSet>) => {
    if (!workout) return;
    const updatedSets = workout.sets.map(s => (s.id === setId ? { ...s, ...fields } : s));
    onUpdateWorkout({
      ...workout,
      sets: updatedSets
    });
  };

  // Remove set
  const handleRemoveSet = (setId: string) => {
    if (!workout) return;
    triggerHaptic('light');
    const updatedSets = workout.sets.filter(s => s.id !== setId);
    onUpdateWorkout({
      ...workout,
      sets: updatedSets
    });
  };

  // Remove entire exercise
  const handleRemoveExercise = (exerciseId: string) => {
    if (!workout) return;
    triggerHaptic('warning');
    const updatedSets = workout.sets.filter(s => s.exercise_id !== exerciseId);
    onUpdateWorkout({
      ...workout,
      sets: updatedSets
    });
  };

  // Finish Workout
  const handleFinish = () => {
    if (!workout) return;
    triggerHaptic('success');
    gymAudio.playPRCelebration();

    // Burst confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const finishedWorkout: Workout = {
      ...workout,
      end_time: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      total_volume_kg: totalVolume,
      is_completed: true
    };

    onFinishWorkout(finishedWorkout);
  };

  // Filtered exercises for add modal
  const filteredExercises = exercisesList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || e.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const muscleFilters = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  // Plate calculation helper: (Target - Bar) / 2
  const calcPlates = () => {
    const perSide = Math.max(0, (targetWeight - barWeight) / 2);
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    let remaining = perSide;
    const result: { plate: number; count: number }[] = [];

    plates.forEach(p => {
      const count = Math.floor(remaining / p);
      if (count > 0) {
        result.push({ plate: p, count });
        remaining = Math.round((remaining - count * p) * 100) / 100;
      }
    });

    return { perSide, result, remaining };
  };

  // -------------------------------------------------------------
  // Render: NO ACTIVE WORKOUT -> Routine launcher
  // -------------------------------------------------------------
  if (!workout) {
    return (
      <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Personal Gym</h1>
            <p className="text-xs text-slate-400">Track your daily exercises & records</p>
          </div>
          <button
            onClick={() => setIsPlateCalcOpen(true)}
            className="p-2.5 bg-gym-900 border border-gym-800 rounded-xl text-slate-300 hover:text-emerald-400 active:scale-95 transition"
            title="Barbell Plate Calculator"
          >
            <Calculator size={20} />
          </button>
        </div>

        {/* Quick Start Empty Button */}
        <button
          onClick={handleStartEmpty}
          className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gym-950 font-black rounded-2xl flex items-center justify-between shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-98 transition mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gym-950/20 flex items-center justify-center">
              <Plus size={24} className="text-gym-950 font-bold" />
            </div>
            <div className="text-left">
              <span className="block text-base leading-tight">Start Empty Workout</span>
              <span className="text-xs text-gym-950/70 font-medium">Add exercises as you go</span>
            </div>
          </div>
          <ChevronRight size={20} />
        </button>

        {/* Workout Routine Templates */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-400" /> Workout Routines
            </h2>
            <span className="text-xs text-slate-500">{WORKOUT_TEMPLATES.length} templates</span>
          </div>

          <div className="space-y-3">
            {WORKOUT_TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => handleStartTemplate(tpl)}
                className="bg-gym-900/80 border border-gym-800 hover:border-emerald-500/50 p-4 rounded-2xl active:scale-[0.99] transition cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-white text-base">{tpl.name}</h3>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {tpl.exercises.length} Exercises
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.target_muscles.map(m => (
                    <span
                      key={m}
                      className="text-[10px] font-medium bg-gym-800 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plate Calculator Modal */}
        {isPlateCalcOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-gym-900 border border-gym-700 w-full max-w-sm rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator size={20} className="text-emerald-400" /> Plate Calculator
                </h3>
                <button
                  onClick={() => setIsPlateCalcOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Target Weight ({unit})
                </label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={e => setTargetWeight(Number(e.target.value))}
                  className="w-full bg-gym-950 border border-gym-700 rounded-xl px-4 py-2.5 text-xl font-bold text-white text-center focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="bg-gym-950/60 p-4 rounded-2xl border border-gym-800 mb-4">
                <div className="text-xs text-slate-400 mb-2">
                  Each side of standard {barWeight}{unit} barbell:
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono mb-3">
                  {calcPlates().perSide} {unit} / side
                </div>

                <div className="space-y-1.5">
                  {calcPlates().result.map(p => (
                    <div
                      key={p.plate}
                      className="flex items-center justify-between text-xs bg-gym-900 px-3 py-1.5 rounded-lg"
                    >
                      <span className="font-semibold text-white">
                        {p.count} × {p.plate} {unit} plate
                      </span>
                      <span className="text-slate-400">{p.count * p.plate} {unit}</span>
                    </div>
                  ))}
                  {calcPlates().result.length === 0 && (
                    <p className="text-xs text-slate-500">Weight is less than empty bar ({barWeight}{unit}).</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsPlateCalcOpen(false)}
                className="w-full py-2.5 bg-emerald-500 font-bold text-gym-950 rounded-xl text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: ACTIVE WORKOUT SESSION
  // -------------------------------------------------------------
  return (
    <div className="pb-36 pt-2 px-3 max-w-md mx-auto">
      {/* Top Floating Dashboard */}
      <div className="sticky top-0 z-30 bg-gym-950/90 backdrop-blur-xl border-b border-gym-800 py-3 mb-4 -mx-3 px-3">
        <div className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={workout.name}
            onChange={e => onUpdateWorkout({ ...workout, name: e.target.value })}
            className="bg-transparent text-lg font-black text-white focus:outline-none focus:border-b border-emerald-500 flex-1 mr-2"
          />
          <button
            onClick={handleFinish}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gym-950 font-black rounded-xl text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition flex items-center gap-1.5"
          >
            <Award size={14} /> Finish
          </button>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-gym-900 border border-gym-800 px-3 py-1.5 rounded-xl flex-1 justify-center text-slate-300">
            <Clock size={14} className="text-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold">{formatDuration(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-gym-900 border border-gym-800 px-3 py-1.5 rounded-xl flex-1 justify-center text-slate-300">
            <Dumbbell size={14} className="text-teal-400" />
            <span className="font-mono font-semibold">{totalVolume.toLocaleString()} {unit}</span>
          </div>

          <button
            onClick={() => {
              if (confirm('Discard this workout? Data will not be saved.')) {
                onDiscardWorkout();
              }
            }}
            className="px-2.5 py-1.5 bg-gym-900 border border-gym-800 hover:border-red-500/40 rounded-xl text-slate-400 hover:text-red-400 transition"
            title="Discard"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {exerciseGroups.map(group => {
          const exObj = exercisesList.find(e => e.id === group.exercise_id);
          const prev = gymStorage.getLastPerformance(group.exercise_id);

          return (
            <div
              key={group.exercise_id}
              className="bg-gym-900/90 border border-gym-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Exercise Header */}
              <div className="p-3.5 border-b border-gym-800/80 flex items-center justify-between bg-gym-850/50">
                <div>
                  <h3 className="font-bold text-white text-sm">{group.exercise_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {exObj && (
                      <span className="text-[10px] text-slate-400">
                        {exObj.muscle_group} • {exObj.equipment}
                      </span>
                    )}
                    {prev && (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Last: {prev.weight}{unit} × {prev.reps}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveExercise(group.exercise_id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                  title="Remove exercise"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Sets Table Header */}
              <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-400 px-3 py-2 bg-gym-950/40 text-center uppercase tracking-wider">
                <span className="col-span-2 text-left">Set</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-3">Weight ({unit})</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-2">Done</span>
              </div>

              {/* Set Rows */}
              <div className="divide-y divide-gym-800/50">
                {group.sets.map((set, idx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-1 items-center px-3 py-2 text-xs transition ${
                      set.is_completed ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    {/* Set Number */}
                    <span className="col-span-2 font-mono font-bold text-slate-300">
                      #{idx + 1}
                    </span>

                    {/* Set Type Selector */}
                    <div className="col-span-2 flex justify-center">
                      <select
                        value={set.set_type}
                        onChange={e => handleUpdateSetValue(set.id, { set_type: e.target.value as SetType })}
                        className="bg-gym-800 text-[10px] font-bold text-slate-300 rounded px-1 py-0.5 border border-gym-700 focus:outline-none"
                      >
                        <option value="normal">N</option>
                        <option value="warmup">W</option>
                        <option value="drop">D</option>
                        <option value="failure">F</option>
                      </select>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-3 px-1">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight === 0 ? '' : set.weight}
                        placeholder="0"
                        onChange={e => handleUpdateSetValue(set.id, { weight: Number(e.target.value) })}
                        className="w-full bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3 px-1">
                      <input
                        type="number"
                        value={set.reps === 0 ? '' : set.reps}
                        placeholder="0"
                        onChange={e => handleUpdateSetValue(set.id, { reps: Number(e.target.value) })}
                        className="w-full bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none"
                      />
                    </div>

                    {/* Completion Checkbox & Delete */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleToggleSet(set.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                          set.is_completed
                            ? 'bg-emerald-500 text-gym-950 shadow-[0_0_10px_#10b981]'
                            : 'bg-gym-800 border border-gym-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                        <Check size={16} className={set.is_completed ? 'stroke-[3]' : ''} />
                      </button>
                      {group.sets.length > 1 && (
                        <button
                          onClick={() => handleRemoveSet(set.id)}
                          className="p-1 text-slate-600 hover:text-red-400 rounded transition"
                          title="Delete set"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <div className="p-2 bg-gym-950/20 border-t border-gym-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleAddSet(group.exercise_id, group.exercise_name)}
                  className="w-full py-1.5 bg-gym-800/60 hover:bg-gym-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                >
                  <Plus size={14} /> Add Set
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exercise Floating Button */}
      <div className="mt-5">
        <button
          onClick={() => setIsAddExerciseOpen(true)}
          className="w-full py-3.5 bg-gym-900 border-2 border-dashed border-gym-700 hover:border-emerald-500 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
        >
          <Plus size={18} /> Add Exercise
        </button>
      </div>

      {/* Add Exercise Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4">
          <div className="bg-gym-900 border border-gym-700 w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
            {/* Header */}
            <div className="p-4 border-b border-gym-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Select Exercise</h3>
              <button
                onClick={() => setIsAddExerciseOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-gym-800">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bench press, squat, curl..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gym-950 border border-gym-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Muscle Chips */}
              <div className="flex gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
                {muscleFilters.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      selectedMuscle === m
                        ? 'bg-emerald-500 text-gym-950 font-bold'
                        : 'bg-gym-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="overflow-y-auto divide-y divide-gym-800/60 p-2 flex-1">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className="p-3 hover:bg-gym-800/50 rounded-xl cursor-pointer flex items-center justify-between active:scale-[0.99] transition"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{ex.name}</h4>
                    <span className="text-xs text-slate-400">
                      {ex.muscle_group} • {ex.equipment}
                    </span>
                  </div>
                  <Plus size={18} className="text-emerald-400" />
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No exercises found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
