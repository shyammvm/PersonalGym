export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'
  | 'Cardio';

export type EquipmentType = 
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Other';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: EquipmentType;
  default_rest_seconds: number;
  instructions?: string;
  is_custom?: boolean;
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  set_type: SetType;
  weight: number;
  reps: number;
  rest_seconds: number;
  rpe?: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface Workout {
  id: string;
  name: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  notes?: string;
  total_volume_kg: number;
  is_completed: boolean;
  sets: WorkoutSet[];
}

export interface UserStreaks {
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
  total_workouts: number;
  workouts_this_week: number;
  active_dates: string[]; // YYYY-MM-DD
}

export interface AppSettings {
  unit: 'kg' | 'lbs';
  sound_enabled: boolean;
  vibrate_enabled: boolean;
  auto_start_timer: boolean;
  default_rest_seconds: number;
  supabase_url: string;
  supabase_anon_key: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  target_muscles: string[];
  exercises: {
    exercise_id: string;
    target_sets: number;
    target_reps: number;
    rest_seconds: number;
  }[];
}

