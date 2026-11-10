import { Workout, UserStreaks } from '../types';

export function getISODateString(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreaks(workouts: Workout[]): UserStreaks {
  const completedWorkouts = workouts.filter(w => w.is_completed);
  if (completedWorkouts.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      last_workout_date: null,
      total_workouts: 0,
      workouts_this_week: 0,
      active_dates: []
    };
  }

  // Extract unique active workout dates sorted descending (latest first)
  const uniqueDatesMap = new Set<string>();
  completedWorkouts.forEach(w => {
    uniqueDatesMap.add(getISODateString(w.start_time));
  });

  const sortedDates = Array.from(uniqueDatesMap).sort((a, b) => b.localeCompare(a));
  const activeDates = sortedDates;

  const todayStr = getISODateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getISODateString(yesterday);

  // Check if current streak is alive (workout occurred today or yesterday)
  let currentStreak = 0;
  let streakCheckingDate = new Date();

  // If there is a workout today, start from today; else if yesterday, start from yesterday; else 0
  if (sortedDates.includes(todayStr)) {
    streakCheckingDate = new Date();
  } else if (sortedDates.includes(yesterdayStr)) {
    streakCheckingDate = new Date(yesterday);
  } else {
    streakCheckingDate = new Date(0); // broken streak
  }

  if (streakCheckingDate.getTime() > 0) {
    while (true) {
      const checkStr = getISODateString(streakCheckingDate);
      if (uniqueDatesMap.has(checkStr)) {
        currentStreak++;
        // Move back 1 day
        streakCheckingDate.setDate(streakCheckingDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  if (sortedDates.length > 0) {
    // Sort chronological ascending
    const chronoDates = [...sortedDates].sort((a, b) => a.localeCompare(b));
    let currentRun = 1;
    longestStreak = 1;

    for (let i = 1; i < chronoDates.length; i++) {
      const prevDate = new Date(chronoDates[i - 1]);
      const currDate = new Date(chronoDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
        if (currentRun > longestStreak) {
          longestStreak = currentRun;
        }
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
  }

  // Workouts this week (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const workoutsThisWeek = completedWorkouts.filter(w => {
    return new Date(w.start_time) >= monday;
  }).length;

  return {
    current_streak: currentStreak,
    longest_streak: Math.max(longestStreak, currentStreak),
    last_workout_date: sortedDates[0] || null,
    total_workouts: completedWorkouts.length,
    workouts_this_week: workoutsThisWeek,
    active_dates: activeDates
  };
}

