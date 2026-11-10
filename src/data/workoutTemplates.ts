import { WorkoutTemplate } from '../types';

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl-push',
    name: 'Push (Chest, Shoulders, Triceps)',
    description: 'Classic pushing routine focusing on pectoral, anterior deltoid and triceps hypertrophy.',
    target_muscles: ['Chest', 'Shoulders', 'Arms'],
    exercises: [
      { exercise_id: 'ex-bench-press', target_sets: 4, target_reps: 8, rest_seconds: 120 },
      { exercise_id: 'ex-incline-db-press', target_sets: 3, target_reps: 10, rest_seconds: 90 },
      { exercise_id: 'ex-db-shoulder-press', target_sets: 3, target_reps: 10, rest_seconds: 90 },
      { exercise_id: 'ex-lateral-raise', target_sets: 4, target_reps: 15, rest_seconds: 60 },
      { exercise_id: 'ex-tricep-pushdown', target_sets: 3, target_reps: 12, rest_seconds: 60 }
    ]
  },
  {
    id: 'tpl-pull',
    name: 'Pull (Back, Biceps, Rear Delts)',
    description: 'Comprehensive pulling routine for lat width, upper back thickness, and bicep peaks.',
    target_muscles: ['Back', 'Arms', 'Shoulders'],
    exercises: [
      { exercise_id: 'ex-deadlift', target_sets: 3, target_reps: 5, rest_seconds: 180 },
      { exercise_id: 'ex-pullup', target_sets: 3, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-barbell-row', target_sets: 3, target_reps: 10, rest_seconds: 90 },
      { exercise_id: 'ex-face-pull', target_sets: 4, target_reps: 15, rest_seconds: 60 },
      { exercise_id: 'ex-barbell-curl', target_sets: 3, target_reps: 10, rest_seconds: 60 },
      { exercise_id: 'ex-db-hammer-curl', target_sets: 3, target_reps: 12, rest_seconds: 60 }
    ]
  },
  {
    id: 'tpl-legs',
    name: 'Legs & Calves Power',
    description: 'High intensity lower body workout building quad power, hamstring mass, and calves.',
    target_muscles: ['Legs'],
    exercises: [
      { exercise_id: 'ex-barbell-squat', target_sets: 4, target_reps: 6, rest_seconds: 180 },
      { exercise_id: 'ex-romanian-deadlift', target_sets: 3, target_reps: 8, rest_seconds: 120 },
      { exercise_id: 'ex-leg-press', target_sets: 3, target_reps: 12, rest_seconds: 90 },
      { exercise_id: 'ex-leg-curl', target_sets: 3, target_reps: 12, rest_seconds: 60 },
      { exercise_id: 'ex-calf-raise', target_sets: 4, target_reps: 15, rest_seconds: 60 }
    ]
  },
  {
    id: 'tpl-upper',
    name: 'Upper Body Heavy',
    description: 'Balanced upper body strength session hitting chest, back, shoulders, and arms.',
    target_muscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    exercises: [
      { exercise_id: 'ex-bench-press', target_sets: 4, target_reps: 6, rest_seconds: 120 },
      { exercise_id: 'ex-lat-pulldown', target_sets: 4, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-overhead-press', target_sets: 3, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-seated-cable-row', target_sets: 3, target_reps: 10, rest_seconds: 75 },
      { exercise_id: 'ex-dips-chest', target_sets: 3, target_reps: 10, rest_seconds: 60 }
    ]
  },
  {
    id: 'tpl-full-body',
    name: 'Full Body Blast',
    description: 'Efficient full body workout hitting all major movement patterns.',
    target_muscles: ['Full Body'],
    exercises: [
      { exercise_id: 'ex-barbell-squat', target_sets: 3, target_reps: 8, rest_seconds: 120 },
      { exercise_id: 'ex-bench-press', target_sets: 3, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-barbell-row', target_sets: 3, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-overhead-press', target_sets: 3, target_reps: 8, rest_seconds: 90 },
      { exercise_id: 'ex-hanging-leg-raise', target_sets: 3, target_reps: 12, rest_seconds: 60 }
    ]
  }
];
