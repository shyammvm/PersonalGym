import React, { useState } from 'react';
import { 
  Settings, Database, Smartphone, Check, Sparkles, 
  Volume2, SmartphoneNfc, Clock, Copy, 
  Lock, Shield, CloudDownload, Trash2
} from 'lucide-react';
import { AppSettings } from '../types';
import { updateSupabaseConfig, getSupabaseClient } from '../services/supabase';
import { gymStorage } from '../services/storage';
import { gymAudio } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabase_url || localStorage.getItem('irontrack_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabase_anon_key || localStorage.getItem('irontrack_supabase_key') || '');
  const [isSaved, setIsSaved] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // PIN Lock State
  const [pinEnabled, setPinEnabled] = useState(Boolean(settings.pin_lock_enabled));
  const [pinCode, setPinCode] = useState(settings.pin_code || '');

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    updateSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    onUpdateSettings({
      ...settings,
      supabase_url: supabaseUrl.trim(),
      supabase_anon_key: supabaseKey.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleManualSync = async () => {
    triggerHaptic('light');
    setSyncStatus('Syncing from Supabase...');
    const res = await gymStorage.pullFromSupabase();
    if (res.success) {
      onRefreshData();
      setSyncStatus(`Successfully loaded ${res.count} workouts from Supabase.`);
    } else {
      setSyncStatus(`Sync error: ${res.error}`);
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleSavePin = (enabled: boolean, code: string) => {
    triggerHaptic('light');
    setPinEnabled(enabled);
    setPinCode(code);
    onUpdateSettings({
      ...settings,
      pin_lock_enabled: enabled,
      pin_code: code
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all workout history from this device?')) {
      triggerHaptic('warning');
      gymStorage.clearAllWorkouts();
      onRefreshData();
      alert('All workout history cleared from local device.');
    }
  };

  const handleLoadDemo = () => {
    if (confirm('Load demo workout logs? This will populate 3 workouts with active streaks.')) {
      triggerHaptic('medium');
      gymStorage.seedDemoData();
      onRefreshData();
      alert('Demo data loaded! Check out your Streaks and History tabs.');
    }
  };

  const isSupabaseActive = Boolean(getSupabaseClient(supabaseUrl, supabaseKey));

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Settings <Settings size={22} className="text-emerald-400" />
          </h1>
          <p className="text-xs text-slate-400">Preferences, Supabase Cloud & Privacy</p>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-4 mb-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={18} />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block font-bold mb-0.5">Zero Sign-In • 100% Private</strong>
            No email or password needed! Your Supabase database is your private personal instance. Credentials are stored exclusively on your phone&rsquo;s browser storage and are <strong>never</strong> committed to your public GitHub repo.
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-4 mb-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Preferences
        </h2>

        {/* Weight Unit */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Weight Unit</span>
            <span className="text-xs text-slate-400">Kilograms or Pounds</span>
          </div>
          <div className="flex bg-gym-950 p-1 rounded-xl border border-gym-800">
            <button
              onClick={() => {
                triggerHaptic('light');
                onUpdateSettings({ ...settings, unit: 'kg' });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.unit === 'kg'
                  ? 'bg-emerald-500 text-gym-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                onUpdateSettings({ ...settings, unit: 'lbs' });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.unit === 'lbs'
                  ? 'bg-emerald-500 text-gym-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LBS
            </button>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between pt-2 border-t border-gym-800/60">
          <div className="flex items-center gap-2.5">
            <Volume2 size={18} className="text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-white block">Rest Audio Chimes</span>
              <span className="text-xs text-slate-400">Countdown ticks & finish chime</span>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !settings.sound_enabled;
              if (next) gymAudio.playRestCompleteChime();
              onUpdateSettings({ ...settings, sound_enabled: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              settings.sound_enabled ? 'bg-emerald-500' : 'bg-gym-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.sound_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptic Vibration */}
        <div className="flex items-center justify-between pt-2 border-t border-gym-800/60">
          <div className="flex items-center gap-2.5">
            <SmartphoneNfc size={18} className="text-teal-400" />
            <div>
              <span className="text-sm font-bold text-white block">Haptic Feedback</span>
              <span className="text-xs text-slate-400">Vibration for sets & timers</span>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !settings.vibrate_enabled;
              if (next) triggerHaptic('medium');
              onUpdateSettings({ ...settings, vibrate_enabled: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              settings.vibrate_enabled ? 'bg-emerald-500' : 'bg-gym-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.vibrate_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto Start Timer */}
        <div className="flex items-center justify-between pt-2 border-t border-gym-800/60">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-orange-400" />
            <div>
              <span className="text-sm font-bold text-white block">Auto-Start Rest Timer</span>
              <span className="text-xs text-slate-400">When set completion is checked</span>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onUpdateSettings({ ...settings, auto_start_timer: !settings.auto_start_timer });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              settings.auto_start_timer ? 'bg-emerald-500' : 'bg-gym-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.auto_start_timer ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Supabase Connection Setup */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Supabase Cloud Sync</h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isSupabaseActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isSupabaseActive ? 'Connected' : 'Offline / Local'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Enter your private Supabase project credentials. Every workout automatically syncs to your personal cloud PostgreSQL database.
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyz.supabase.co"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              className="w-full bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gym-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
            >
              {isSaved ? <Check size={14} /> : null}
              {isSaved ? 'Saved Credentials!' : 'Save Supabase Credentials'}
            </button>

            <button
              type="button"
              onClick={() => {
                const schema = `File: supabase/schema.sql in your repo contains the complete database migration!`;
                navigator.clipboard?.writeText(schema);
                setSchemaCopied(true);
                setTimeout(() => setSchemaCopied(false), 2500);
              }}
              className="p-2.5 bg-gym-800 hover:bg-gym-700 text-slate-300 rounded-xl text-xs transition"
              title="Copy schema path"
            >
              {schemaCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
        </form>

        {isSupabaseActive && (
          <div className="mt-3 pt-3 border-t border-gym-800">
            <button
              onClick={handleManualSync}
              className="w-full py-2 bg-gym-950 hover:bg-gym-800 border border-gym-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <CloudDownload size={14} className="text-emerald-400" /> Fetch Workouts from Supabase
            </button>
            {syncStatus && (
              <p className="text-[11px] text-emerald-400 font-mono text-center mt-2">{syncStatus}</p>
            )}
          </div>
        )}
      </div>

      {/* 4-Digit Privacy PIN Lock */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-4 mb-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-teal-400" />
            <div>
              <h2 className="text-sm font-bold text-white block">Optional 4-Digit PIN Lock</h2>
              <span className="text-xs text-slate-400">Lock app on launch & backgrounding</span>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !pinEnabled;
              handleSavePin(next, pinCode || '1234');
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              pinEnabled ? 'bg-emerald-500' : 'bg-gym-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                pinEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {pinEnabled && (
          <div className="pt-2 border-t border-gym-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">Set 4-Digit PIN:</span>
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              placeholder="1234"
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                handleSavePin(true, val);
              }}
              className="w-24 bg-gym-950 border border-gym-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-center text-sm font-mono font-bold text-white tracking-widest focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* iLoader & iOS Deployment Guide */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-4 mb-5 shadow-sm">
        <div
          onClick={() => setActiveAccordion(activeAccordion === 'iloader' ? null : 'iloader')}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-teal-400" />
            <h2 className="text-sm font-bold text-white">iPhone & iLoader Setup Guide</h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            {activeAccordion === 'iloader' ? 'Hide' : 'View'}
          </span>
        </div>

        {activeAccordion === 'iloader' && (
          <div className="mt-3 pt-3 border-t border-gym-800/80 text-xs text-slate-300 space-y-3 leading-relaxed">
            <div className="bg-gym-950/60 p-3 rounded-xl border border-gym-800">
              <strong className="text-emerald-400 block mb-1">Option 1: Sideload with iLoader (iOS App)</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Run <code className="bg-gym-900 px-1 py-0.5 rounded text-emerald-300 font-mono">./scripts/build_ipa.sh</code> or download the <code className="text-emerald-300">IronTrack.ipa</code> from GitHub Actions releases.</li>
                <li>Connect your iPhone with USB / Wi-Fi and open <strong>iLoader</strong> on your computer.</li>
                <li>Select <code className="text-emerald-300">IronTrack.ipa</code> and click Sideload.</li>
                <li>On your iPhone, go to <em>Settings &gt; General &gt; VPN &amp; Device Management</em> and trust your developer certificate.</li>
              </ol>
            </div>

            <div className="bg-gym-950/60 p-3 rounded-xl border border-gym-800">
              <strong className="text-teal-400 block mb-1">Option 2: Instant PWA (No Sideloading Required)</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Open your GitHub Pages URL in <strong>Safari</strong> on your iPhone.</li>
                <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
                <li>Tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                <li>Launches like a native full-screen app right from your home screen!</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="bg-gym-900/60 border border-gym-800 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Data Management
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Seed Test Workouts</span>
            <span className="text-[10px] text-slate-400">Populate 3 mock sessions for testing</span>
          </div>
          <button
            onClick={handleLoadDemo}
            className="px-3 py-1.5 bg-gym-800 hover:bg-gym-700 text-slate-200 font-bold rounded-xl text-xs active:scale-95 transition flex items-center gap-1"
          >
            <Sparkles size={12} className="text-amber-400" /> Seed Data
          </button>
        </div>

        <div className="pt-2 border-t border-gym-800/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-400 block">Clear Local Workouts</span>
            <span className="text-[10px] text-slate-400">Reset local device data to zero</span>
          </div>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl text-xs active:scale-95 transition flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};
