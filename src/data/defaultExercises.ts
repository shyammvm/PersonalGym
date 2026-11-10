import { Exercise } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    muscle_group: 'Chest',
    equipment: 'Barbell',
    default_rest_seconds: 120,
    instructions: 'Lower bar to mid-chest, drive up explosively with feet planted.'
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    muscle_group: 'Chest',
    equipment: 'Dumbbell',
    default_rest_seconds: 90,
    instructions: 'Bench at 30-45 degree incline. Control dumbbells down to upper chest.'
  },
  {
    id: 'ex-cable-crossover',
    name: 'Cable Fly / Crossover',
    muscle_group: 'Chest',
    equipment: 'Cable',
    default_rest_seconds: 60,
    instructions: 'Squeeze chest at peak contraction, keep slight bend in elbows.'
  },
  {
    id: 'ex-dips-chest',
    name: 'Chest Dips',
    muscle_group: 'Chest',
    equipment: 'Bodyweight',
    default_rest_seconds: 90,
    instructions: 'Lean forward slightly to target pectoral muscles.'
  },
  {
    id: 'ex-pushup',
    name: 'Push-Ups',
    muscle_group: 'Chest',
    equipment: 'Bodyweight',
    default_rest_seconds: 60,
    instructions: 'Full range of motion, keep core tight and elbows at 45 degrees.'
  },

  // BACK
  {
    id: 'ex-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscle_group: 'Back',
    equipment: 'Barbell',
    default_rest_seconds: 180,
    instructions: 'Hinge at hips, keep spine neutral, drive through floor with legs.'
  },
  {
    id: 'ex-pullup',
    name: 'Pull-Ups / Chin-Ups',
    muscle_group: 'Back',
    equipment: 'Bodyweight',
    default_rest_seconds: 90,
    instructions: 'Full dead-hang at bottom, pull chest to bar with lats engaged.'
  },
  {
    id: 'ex-barbell-row',
    name: 'Bent Over Barbell Row',
    muscle_group: 'Back',
    equipment: 'Barbell',
    default_rest_seconds: 120,
    instructions: 'Torso at 45 degrees, pull barbell toward belly button.'
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    muscle_group: 'Back',
    equipment: 'Cable',
    default_rest_seconds: 75,
    instructions: 'Pull handle down to collarbone, avoiding excessive body swing.'
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row',
    muscle_group: 'Back',
    equipment: 'Cable',
    default_rest_seconds: 75,
    instructions: 'Keep back straight, pull to lower ribcage and squeeze shoulder blades.'
  },
  {
    id: 'ex-dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    muscle_group: 'Back',
    equipment: 'Dumbbell',
    default_rest_seconds: 60,
    instructions: 'Hand on bench, pull dumbbell to hip keeping elbow close to side.'
  },

  // LEGS
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    muscle_group: 'Legs',
    equipment: 'Barbell',
    default_rest_seconds: 180,
    instructions: 'Break at knees and hips simultaneously, descend to parallel or deeper.'
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    muscle_group: 'Legs',
    equipment: 'Machine',
    default_rest_seconds: 120,
    instructions: 'Feet shoulder-width on platform, lower sled with control, do not lock knees.'
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscle_group: 'Legs',
    equipment: 'Barbell',
    default_rest_seconds: 120,
    instructions: 'Hinge hips backwards, feel stretch in hamstrings, keep bar close to shins.'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscle_group: 'Legs',
    equipment: 'Dumbbell',
    default_rest_seconds: 90,
    instructions: 'Rear foot elevated on bench, drop back knee straight down.'
  },
  {
    id: 'ex-leg-curl',
    name: 'Lying Leg Curl',
    muscle_group: 'Legs',
    equipment: 'Machine',
    default_rest_seconds: 60,
    instructions: 'Curl pads toward glutes, keep hips pinned down.'
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    muscle_group: 'Legs',
    equipment: 'Machine',
    default_rest_seconds: 60,
    instructions: 'Extend legs to full contraction at top, control the negative.'
  },
  {
    id: 'ex-calf-raise',
    name: 'Standing Calf Raise',
    muscle_group: 'Legs',
    equipment: 'Machine',
    default_rest_seconds: 60,
    instructions: 'Deep stretch at bottom, explosive rise on balls of feet, hold 1 sec.'
  },

  // SHOULDERS
  {
    id: 'ex-overhead-press',
    name: 'Barbell Overhead Press (OHP)',
    muscle_group: 'Shoulders',
    equipment: 'Barbell',
    default_rest_seconds: 120,
    instructions: 'Press bar overhead in straight path, lock out overhead.'
  },
  {
    id: 'ex-db-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscle_group: 'Shoulders',
    equipment: 'Dumbbell',
    default_rest_seconds: 90,
    instructions: 'Press dumbbells up and slightly inward without clanging.'
  },
  {
    id: 'ex-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscle_group: 'Shoulders',
    equipment: 'Dumbbell',
    default_rest_seconds: 60,
    instructions: 'Lead with elbows, raise dumbbells to shoulder height.'
  },
  {
    id: 'ex-face-pull',
    name: 'Cable Face Pull',
    muscle_group: 'Shoulders',
    equipment: 'Cable',
    default_rest_seconds: 60,
    instructions: 'Pull rope attachment to eyes/forehead, externally rotating shoulders.'
  },
  {
    id: 'ex-reverse-pec-deck',
    name: 'Reverse Pec Deck (Rear Delts)',
    muscle_group: 'Shoulders',
    equipment: 'Machine',
    default_rest_seconds: 60,
    instructions: 'Fly outwards using rear deltoids, keep slight bend in arms.'
  },

  // ARMS
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Bicep Curl',
    muscle_group: 'Arms',
    equipment: 'Barbell',
    default_rest_seconds: 60,
    instructions: 'Lock elbows at your sides, curl bar smoothly up and squeeze biceps.'
  },
  {
    id: 'ex-db-hammer-curl',
    name: 'Dumbbell Hammer Curl',
    muscle_group: 'Arms',
    equipment: 'Dumbbell',
    default_rest_seconds: 60,
    instructions: 'Neutral grip (palms facing each other) targets brachialis and forearms.'
  },
  {
    id: 'ex-incline-db-curl',
    name: 'Incline Dumbbell Curl',
    muscle_group: 'Arms',
    equipment: 'Dumbbell',
    default_rest_seconds: 60,
    instructions: 'Bench at 60 degrees gives full stretch to bicep long head.'
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Tricep Rope Pushdown',
    muscle_group: 'Arms',
    equipment: 'Cable',
    default_rest_seconds: 60,
    instructions: 'Keep upper arms still, spread rope apart at bottom lock.'
  },
  {
    id: 'ex-skull-crusher',
    name: 'EZ-Bar Skull Crusher',
    muscle_group: 'Arms',
    equipment: 'Barbell',
    default_rest_seconds: 75,
    instructions: 'Lower bar towards forehead or crown of head, extend triceps.'
  },

  // CORE
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscle_group: 'Core',
    equipment: 'Bodyweight',
    default_rest_seconds: 60,
    instructions: 'Hang from pull-up bar, curl hips and knees up to chest.'
  },
  {
    id: 'ex-plank',
    name: 'Plank Hold',
    muscle_group: 'Core',
    equipment: 'Bodyweight',
    default_rest_seconds: 60,
    instructions: 'Forearms on floor, maintain straight body line from head to heels.'
  },
  {
    id: 'ex-cable-woodchopper',
    name: 'Cable Woodchopper',
    muscle_group: 'Core',
    equipment: 'Cable',
    default_rest_seconds: 60,
    instructions: 'Rotate torso across body with core engaged, arms extended.'
  }
];

