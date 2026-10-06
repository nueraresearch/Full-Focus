import React from 'react';
import {
  Layers,
  CheckSquare,
  Clock,
  Calendar,
  Share2,
  Plus,
  Play,
  Pause,
  Maximize2
} from 'lucide-react';
import { useApp, ActiveView } from '../context/AppContext';
import { triggerHaptic } from '../utils/androidBridge';
import { formatDuration } from '../utils/prioritization';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsQuickCaptureOpen,
    timer,
    toggleTimer,
    setTimerZenMode,
    tasks
  } = useApp();

  const handleNavClick = (view: ActiveView) => {
    triggerHaptic('tap');
    setActiveView(view);
  };

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'priorities', label: 'Matrix', icon: Layers },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tracking', label: 'Tracking', icon: Clock },
    { id: 'integrations', label: 'MCP & Sync', icon: Share2 }
  ];

  const unreadP1s = tasks.filter((t) => t.priority === 'P1_CRITICAL' && t.status !== 'completed').length;

  return (
    <>
      {/* Mobile Floating Mini Focus HUD (if timer running) */}
      {timer.taskId && (
        <div className="md:hidden fixed bottom-[72px] left-3 right-3 z-40 bg-slate-900/95 border border-indigo-500/50 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="relative flex h-2 w-2 shrink-0">
              {timer.isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  timer.isRunning ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-bold text-white tracking-wider">
                {timer.mode === 'pomodoro'
                  ? `${Math.floor(timer.secondsRemaining / 60)}:${(timer.secondsRemaining % 60)
                      .toString()
                      .padStart(2, '0')}`
                  : formatDuration(timer.elapsedSeconds)}
                <span className="text-[10px] text-indigo-400 uppercase font-mono ml-1.5 font-normal">
                  {timer.phase}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 truncate">{timer.taskTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('medium');
                toggleTimer();
              }}
              className="p-2 rounded-xl bg-indigo-600 active:scale-95 text-white"
            >
              {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => {
                triggerHaptic('tap');
                setTimerZenMode(true);
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Quick Action FAB */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          setIsQuickCaptureOpen(true);
        }}
        aria-label="Create Task"
        className="md:hidden fixed bottom-20 right-4 z-40 h-13 w-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-white/20"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Bottom Thumb Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 pt-1 pb-[max(env(safe-area-inset-bottom,8px),8px)]"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-indigo-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.id === 'priorities' && unreadP1s > 0 && (
                    <span className="absolute -top-1 -right-2 h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {unreadP1s}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
