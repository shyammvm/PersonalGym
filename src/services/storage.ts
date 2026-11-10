import { Workout, Exercise, AppSettings, UserStreaks } from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { calculateStreaks } from '../utils/streaks';
import { getSupabaseClient } from './supabase';

const KEYS = {
  WORKOUTS: 'irontrack_workouts',
  CUSTOM_EXERCISES: 'irontrack_custom_exercises',
  ACTIVE_WORKOUT: 'irontrack_active_workout',
  SETTINGS: 'irontrack_settings',
  STREAKS: 'irontrack_streaks',
};

const DEFAULT_SETTINGS: AppSettings = {
  unit: 'kg',
  sound_enabled: true,
  vibrate_enabled: true,
  auto_start_timer: true,
  default_rest_seconds: 90,
  supabase_url: '',
  supabase_anon_key: ''
};

class GymStorageService {
  // Settings
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Exercises (Built-in + Custom)
  getExercises(): Exercise[] {
    try {
      const customStr = localStorage.getItem(KEYS.CUSTOM_EXERCISES);
      const custom: Exercise[] = customStr ? JSON.parse(customStr) : [];
      return [...DEFAULT_EXERCISES, ...custom];
    } catch {
      return DEFAULT_EXERCISES;
    }
  }

  addCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
    const newEx: Exercise = {
      ...exercise,
      id: `custom-${Date.now()}`,
      is_custom: true
    };
    const current = this.getExercises().filter(e => e.is_custom);
    current.push(newEx);
    localStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(current));
    
    // Attempt Supabase sync
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('exercises').insert({
        id: newEx.id,
        name: newEx.name,
        muscle_group: newEx.muscle_group,
        equipment: newEx.equipment,
        default_rest_seconds: newEx.default_rest_seconds,
        instructions: newEx.instructions
      }).then(({ error }) => {
        if (error) console.warn('Supabase custom exercise sync:', error.message);
      });
    }

    return newEx;
  }

  deleteCustomExercise(id: string): void {
    const current = this.getExercises().filter(e => e.is_custom && e.id !== id);
    localStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(current));
    
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('exercises').delete().eq('id', id).then();
    }
  }

  // Workouts
  getWorkouts(): Workout[] {
    try {
      const stored = localStorage.getItem(KEYS.WORKOUTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
  }

  saveWorkout(workout: Workout): void {
    const workouts = this.getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.unshift(workout); // Most recent first
    }
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

    // Clear active workout if completed
    if (workout.is_completed) {
      this.clearActiveWorkout();
    }

    // Sync with Supabase
    this.syncWorkoutToSupabase(workout);
  }

  deleteWorkout(id: string): void {
    const workouts = this.getWorkouts().filter(w => w.id !== id);
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('workouts').delete().eq('id', id).then();
    }
  }

  // Active workout persistence (survives tab closing & reload)
  getActiveWorkout(): Workout | null {
    try {
      const stored = localStorage.getItem(KEYS.ACTIVE_WORKOUT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null;
  }

  saveActiveWorkout(workout: Workout): void {
    localStorage.setItem(KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  }

  clearActiveWorkout(): void {
    localStorage.removeItem(KEYS.ACTIVE_WORKOUT);
  }

  // Streaks
  getStreaks(): UserStreaks {
    const workouts = this.getWorkouts();
    return calculateStreaks(workouts);
  }

  // Previous performance lookup for an exercise
  getLastPerformance(exerciseId: string): { weight: number; reps: number } | null {
    const workouts = this.getWorkouts();
    for (const w of workouts) {
      const completedSets = w.sets.filter(s => s.exercise_id === exerciseId && s.is_completed);
      if (completedSets.length > 0) {
        // Return the heaviest set or first work set
        const bestSet = completedSets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), completedSets[0]);
        return { weight: bestSet.weight, reps: bestSet.reps };
      }
    }
    return null;
  }

  // One-Rep Max calculation (Epley formula: weight * (1 + reps/30))
  getExercisePR(exerciseId: string): { weight: number; reps: number; oneRepMax: number; date: string } | null {
    const workouts = this.getWorkouts();
    let best = { weight: 0, reps: 0, oneRepMax: 0, date: '' };

    for (const w of workouts) {
      for (const s of w.sets) {
        if (s.exercise_id === exerciseId && s.is_completed && s.weight > 0 && s.reps > 0) {
          const estimated1RM = Math.round(s.weight * (1 + s.reps / 30.0) * 10) / 10;
          if (estimated1RM > best.oneRepMax) {
            best = {
              weight: s.weight,
              reps: s.reps,
              oneRepMax: estimated1RM,
              date: w.start_time
            };
          }
        }
      }
    }

    return best.oneRepMax > 0 ? best : null;
  }

  // Sync to Supabase helper
  private async syncWorkoutToSupabase(workout: Workout) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Upsert Workout
      const { error: wError } = await supabase.from('workouts').upsert({
        id: workout.id,
        user_id: user.id,
        name: workout.name,
        start_time: workout.start_time,
        end_time: workout.end_time || null,
        duration_seconds: workout.duration_seconds,
        notes: workout.notes || '',
        total_volume_kg: workout.total_volume_kg,
        is_completed: workout.is_completed
      });

      if (wError) {
        console.warn('Supabase workout sync error:', wError.message);
        return;
      }

      // 2. Delete existing sets for this workout and insert current
      await supabase.from('workout_sets').delete().eq('workout_id', workout.id);

      if (workout.sets.length > 0) {
        const setsToInsert = workout.sets.map(s => ({
          id: s.id,
          workout_id: workout.id,
          exercise_id: s.exercise_id,
          exercise_name: s.exercise_name,
          set_number: s.set_number,
          set_type: s.set_type,
          weight: s.weight,
          reps: s.reps,
          rest_seconds: s.rest_seconds,
          rpe: s.rpe || null,
          is_completed: s.is_completed,
          completed_at: s.completed_at || null
        }));

        await supabase.from('workout_sets').insert(setsToInsert);
      }

      // 3. Update Streaks in Supabase
      const streaks = this.getStreaks();
      await supabase.from('user_streaks').upsert({
        user_id: user.id,
        current_streak: streaks.current_streak,
        longest_streak: streaks.longest_streak,
        last_workout_date: streaks.last_workout_date,
        total_workouts: streaks.total_workouts,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Supabase sync failure:', e);
    }
  }

  // Seed sample initial data if new user
  seedDemoData(): void {
    const today = new Date();
    const dayAgo = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };

    const demoWorkouts: Workout[] = [
      {
        id: 'demo-w1',
        name: 'Push Day - Chest & Shoulders',
        start_time: dayAgo(0), // Today
        end_time: dayAgo(0),
        duration_seconds: 3420,
        notes: 'Felt strong on bench press! Form felt very stable.',
        total_volume_kg: 4860,
        is_completed: true,
        sets: [
          { id: 'ds1', exercise_id: 'ex-bench-press', exercise_name: 'Barbell Bench Press', set_number: 1, set_type: 'warmup', weight: 60, reps: 10, rest_seconds: 90, is_completed: true },
          { id: 'ds2', exercise_id: 'ex-bench-press', exercise_name: 'Barbell Bench Press', set_number: 2, set_type: 'normal', weight: 85, reps: 8, rest_seconds: 120, is_completed: true },
          { id: 'ds3', exercise_id: 'ex-bench-press', exercise_name: 'Barbell Bench Press', set_number: 3, set_type: 'normal', weight: 85, reps: 8, rest_seconds: 120, is_completed: true },
          { id: 'ds4', exercise_id: 'ex-bench-press', exercise_name: 'Barbell Bench Press', set_number: 4, set_type: 'failure', weight: 90, reps: 6, rest_seconds: 120, is_completed: true },
          { id: 'ds5', exercise_id: 'ex-incline-db-press', exercise_name: 'Incline Dumbbell Press', set_number: 1, set_type: 'normal', weight: 30, reps: 10, rest_seconds: 90, is_completed: true },
          { id: 'ds6', exercise_id: 'ex-incline-db-press', exercise_name: 'Incline Dumbbell Press', set_number: 2, set_type: 'normal', weight: 32, reps: 8, rest_seconds: 90, is_completed: true },
          { id: 'ds7', exercise_id: 'ex-lateral-raise', exercise_name: 'Dumbbell Lateral Raise', set_number: 1, set_type: 'normal', weight: 12, reps: 15, rest_seconds: 60, is_completed: true },
          { id: 'ds8', exercise_id: 'ex-lateral-raise', exercise_name: 'Dumbbell Lateral Raise', set_number: 2, set_type: 'normal', weight: 12, reps: 14, rest_seconds: 60, is_completed: true }
        ]
      },
      {
        id: 'demo-w2',
        name: 'Pull Day - Back & Biceps',
        start_time: dayAgo(1), // Yesterday
        end_time: dayAgo(1),
        duration_seconds: 3100,
        notes: 'Great lat pump with cable pulldowns.',
        total_volume_kg: 5200,
        is_completed: true,
        sets: [
          { id: 'ds9', exercise_id: 'ex-deadlift', exercise_name: 'Conventional Barbell Deadlift', set_number: 1, set_type: 'normal', weight: 120, reps: 5, rest_seconds: 180, is_completed: true },
          { id: 'ds10', exercise_id: 'ex-deadlift', exercise_name: 'Conventional Barbell Deadlift', set_number: 2, set_type: 'normal', weight: 130, reps: 5, rest_seconds: 180, is_completed: true },
          { id: 'ds11', exercise_id: 'ex-pullup', exercise_name: 'Pull-Ups / Chin-Ups', set_number: 1, set_type: 'normal', weight: 0, reps: 10, rest_seconds: 90, is_completed: true },
          { id: 'ds12', exercise_id: 'ex-lat-pulldown', exercise_name: 'Lat Pulldown', set_number: 1, set_type: 'normal', weight: 65, reps: 10, rest_seconds: 75, is_completed: true },
          { id: 'ds13', exercise_id: 'ex-barbell-curl', exercise_name: 'Barbell Bicep Curl', set_number: 1, set_type: 'normal', weight: 35, reps: 10, rest_seconds: 60, is_completed: true }
        ]
      },
      {
        id: 'demo-w3',
        name: 'Legs & Core Crusher',
        start_time: dayAgo(2), // 2 days ago
        end_time: dayAgo(2),
        duration_seconds: 3600,
        notes: 'Squats felt deep and controlled.',
        total_volume_kg: 6100,
        is_completed: true,
        sets: [
          { id: 'ds14', exercise_id: 'ex-barbell-squat', exercise_name: 'Barbell Back Squat', set_number: 1, set_type: 'normal', weight: 100, reps: 6, rest_seconds: 180, is_completed: true },
          { id: 'ds15', exercise_id: 'ex-barbell-squat', exercise_name: 'Barbell Back Squat', set_number: 2, set_type: 'normal', weight: 110, reps: 6, rest_seconds: 180, is_completed: true },
          { id: 'ds16', exercise_id: 'ex-romanian-deadlift', exercise_name: 'Romanian Deadlift (RDL)', set_number: 1, set_type: 'normal', weight: 90, reps: 8, rest_seconds: 120, is_completed: true },
          { id: 'ds17', exercise_id: 'ex-leg-curl', exercise_name: 'Lying Leg Curl', set_number: 1, set_type: 'normal', weight: 50, reps: 12, rest_seconds: 60, is_completed: true }
        ]
      }
    ];

    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(demoWorkouts));
  }
}

export const gymStorage = new GymStorageService();

