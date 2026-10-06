import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Volume2,
  Headphones,
  Sliders,
  Sparkles,
  Zap,
  Coffee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/prioritization';
import { AmbientSoundType } from '../utils/audio';

export const TimerHUD: React.FC = () => {
  const {
    timer,
    toggleTimer,
    resetTimer,
    finishTimerAndLog,
    setTimerAmbient,
    setTimerZenMode,
    setTimerConfig
  } = useApp();

  if (!timer.zenMode && !timer.taskId) {
    return null;
  }

  const minutes = timer.mode === 'pomodoro' ? Math.floor(timer.secondsRemaining / 60) : Math.floor(timer.elapsedSeconds / 60);
  const seconds = timer.mode === 'pomodoro' ? timer.secondsRemaining % 60 : timer.elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalCycleSeconds = timer.phase === 'focus' ? timer.pomodoroMinutes * 60 : timer.breakMinutes * 60;
  const progressPercent =
    timer.mode === 'pomodoro'
      ? Math.max(0, Math.min(100, ((totalCycleSeconds - timer.secondsRemaining) / totalCycleSeconds) * 100))
      : 100;

  const ambientSounds: { id: AmbientSoundType; label: string; desc: string }[] = [
    { id: 'none', label: 'Off', desc: 'Silence' },
    { id: 'binaural_40hz', label: '40Hz Gamma', desc: 'Peak Focus' },
    { id: 'deep_space', label: 'Deep Space', desc: 'Warm Drone' },
    { id: 'rain', label: 'Gentle Rain', desc: 'Acoustic Masking' },
    { id: 'white_noise', label: 'White Noise', desc: 'Static Mask' }
  ];

  // Full-screen Zen Mode Overlay
  if (timer.zenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-300">
        {/* Top Zen Bar */}
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400">
              {timer.phase === 'focus' ? 'DEEP FOCUS SPRINT' : 'RESTORATIVE INTERVAL'}
            </span>
          </div>

          <button
            onClick={() => setTimerZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </button>
        </div>

        {/* Center Clock Circle */}
        <div className="flex flex-col items-center text-center my-auto">
          {/* Circular ring representation */}
          <div className="relative flex items-center justify-center w-72 h-72 sm:w-84 sm:h-84">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-900"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-5xl sm:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl">
                {timeFormatted}
              </span>
              <span className="text-xs text-indigo-300/80 font-mono mt-2 uppercase tracking-wider">
                {timer.mode === 'pomodoro' ? `${timer.phase.replace('_', ' ')}` : 'Continuous Flow'}
              </span>
            </div>
          </div>

          {/* Active Task Name */}
          <h2 className="mt-8 text-xl sm:text-2xl font-bold text-slate-100 max-w-xl line-clamp-2 px-4">
            {timer.taskTitle || 'Focused Execution'}
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-indigo-400 border border-indigo-500/30">
              {timer.platform.toUpperCase()}
            </span>
          </div>

          {/* Large Zen Controls */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl transition active:scale-95 cursor-pointer ${
                timer.isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {timer.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{timer.isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                finishTimerAndLog();
                setTimerZenMode(false);
              }}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete & Log Time</span>
            </button>
          </div>
        </div>

        {/* Ambient Synthesizer Selector */}
        <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Headphones className="w-4 h-4 text-indigo-400" />
              <span>Neuro-Acoustic Ambient Synthesis</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Web Audio API • Zero latency</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ambientSounds.map((s) => (
              <button
                key={s.id}
                onClick={() => setTimerAmbient(s.id)}
                className={`p-2 rounded-xl text-left border transition ${
                  timer.ambientSound === s.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">{s.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Floating Mini-HUD (when in standard view)
  return (
    <div className="fixed bottom-5 right-5 z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md max-w-sm w-full animate-in slide-in-from-bottom-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`h-2 w-2 rounded-full ${
                timer.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
              {timer.mode === 'pomodoro' ? `${timer.phase.replace('_', ' ')}` : 'Continuous Stopwatch'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-100 truncate">{timer.taskTitle || 'Untitled Focus Session'}</h4>
        </div>

        <button
          onClick={() => setTimerZenMode(true)}
          title="Open Fullscreen Zen View"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="font-mono text-2xl font-black text-white tracking-tight">
          {timeFormatted}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              timer.isRunning
                ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={resetTimer}
            title="Reset"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={finishTimerAndLog}
            title="Save Log"
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Progress Bar */}
      {timer.mode === 'pomodoro' && (
        <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
