import React, { useState } from 'react';
import { 
  Settings, Database, Smartphone, Check, Sparkles, 
  Volume2, SmartphoneNfc, Clock, RefreshCw, Copy
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>('iloader');

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
          <p className="text-xs text-slate-400">Preferences, Supabase & iOS Sideloading</p>
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

      {/* Supabase Database Configuration */}
      <div className="bg-gym-900/90 border border-gym-800 rounded-3xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Supabase Cloud Database</h2>
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
          IronTrack stores workouts locally first, then syncs to your Supabase PostgreSQL tables in real-time.
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
              {isSaved ? 'Saved & Synced!' : 'Save Supabase Credentials'}
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
                <li>Connect your iPhone with USB / Wi-Fi and open <strong>iLoader</strong> (or SideStore/AltStore) on your computer.</li>
                <li>Select <code className="text-emerald-300">IronTrack.ipa</code> and click Sideload.</li>
                <li>On your iPhone, go to <em>Settings &gt; General &gt; VPN &amp; Device Management</em> and trust your developer certificate. Enjoy native haptics &amp; background timers!</li>
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

      {/* Demo Data & Diagnostics */}
      <div className="bg-gym-900/60 border border-gym-800 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-400" /> Demo Sample Data
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Populate test workouts to preview streaks & history.
            </p>
          </div>
          <button
            onClick={handleLoadDemo}
            className="px-3 py-1.5 bg-gym-800 hover:bg-gym-700 text-slate-200 font-bold rounded-xl text-xs active:scale-95 transition flex items-center gap-1"
          >
            <RefreshCw size={12} /> Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};

