import { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { StreaksView } from './components/StreaksView';
import { HistoryView } from './components/HistoryView';
import { ExercisesView } from './components/ExercisesView';
import { SettingsView } from './components/SettingsView';
import { RestTimerFloating } from './components/RestTimerFloating';
import { Workout, AppSettings, UserStreaks } from './types';
import { gymStorage } from './services/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const [settings, setSettings] = useState<AppSettings>(gymStorage.getSettings());
  const [workout, setWorkout] = useState<Workout | null>(gymStorage.getActiveWorkout());
  const [workoutsList, setWorkoutsList] = useState<Workout[]>(gymStorage.getWorkouts());
  const [streaks, setStreaks] = useState<UserStreaks>(gymStorage.getStreaks());

  // Rest Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerExerciseName, setTimerExerciseName] = useState('');

  // Initial load: check if first time, seed demo data automatically so user gets immediate visual feedback
  useEffect(() => {
    const existing = gymStorage.getWorkouts();
    if (existing.length === 0) {
      gymStorage.seedDemoData();
      refreshData();
    }
  }, []);

  // Update streaks whenever workouts change
  const refreshData = () => {
    const list = gymStorage.getWorkouts();
    setWorkoutsList(list);
    setStreaks(gymStorage.getStreaks());
  };

  const handleUpdateWorkout = (updated: Workout) => {
    setWorkout(updated);
    gymStorage.saveActiveWorkout(updated);
  };

  const handleFinishWorkout = (finished: Workout) => {
    gymStorage.saveWorkout(finished);
    setWorkout(null);
    refreshData();
    setActiveTab('streaks'); // Jump to streaks so user sees the reward!
  };

  const handleDiscardWorkout = () => {
    gymStorage.clearActiveWorkout();
    setWorkout(null);
  };

  const handleStartRestTimer = (seconds: number, exerciseName: string) => {
    setTimerSeconds(seconds);
    setTimerExerciseName(exerciseName);
    setTimerActive(true);
  };

  const handleDeleteWorkout = (id: string) => {
    gymStorage.deleteWorkout(id);
    refreshData();
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    gymStorage.saveSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gym-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Safe Area Spacing */}
      <div className="h-[env(safe-area-inset-top,8px)] bg-gym-950" />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-x-hidden">
        {activeTab === 'workout' && (
          <ActiveWorkoutView
            workout={workout}
            unit={settings.unit}
            autoStartTimer={settings.auto_start_timer}
            onUpdateWorkout={handleUpdateWorkout}
            onFinishWorkout={handleFinishWorkout}
            onDiscardWorkout={handleDiscardWorkout}
            onStartRestTimer={handleStartRestTimer}
          />
        )}

        {activeTab === 'streaks' && (
          <StreaksView streaks={streaks} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            workouts={workoutsList}
            unit={settings.unit}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesView unit={settings.unit} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Floating Rest Timer (active during workout or in background) */}
      {timerActive && (
        <RestTimerFloating
          initialSeconds={timerSeconds}
          exerciseName={timerExerciseName}
          soundEnabled={settings.sound_enabled}
          vibrateEnabled={settings.vibrate_enabled}
          onFinish={() => setTimerActive(false)}
          onClose={() => setTimerActive(false)}
        />
      )}

      {/* Bottom Mobile Tab Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveWorkout={Boolean(workout)}
        currentStreak={streaks.current_streak}
      />
    </div>
  );
}

export default App;
