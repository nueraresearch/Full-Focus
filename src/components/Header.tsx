import React, { useState } from 'react';
import {
  Layers,
  CheckSquare,
  Calendar,
  Clock,
  Target,
  Share2,
  Play,
  Pause,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Inbox,
  Bot
} from 'lucide-react';
import { useApp, ActiveView } from '../context/AppContext';
import { formatDuration } from '../utils/prioritization';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    timer,
    toggleTimer,
    finishTimerAndLog,
    setTimerZenMode,
    toggleSoundEnabled,
    setIsQuickCaptureOpen,
    setIsCommandPaletteOpen,
    setIsChatWidgetOpen,
    setIsIngestionOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    selectedPlatformFilter,
    setSelectedPlatformFilter
  } = useApp();

  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'priorities', label: 'Prioritize & Matrix', icon: Layers },
    { id: 'tasks', label: 'Tasks & Sprints', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar & Blocks', icon: Calendar },
    { id: 'tracking', label: 'Time Tracking', icon: Clock },
    { id: 'objectives', label: 'Objectives & OKRs', icon: Target },
    { id: 'integrations', label: 'Integrations Hub', icon: Share2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Workspace Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <span className="text-sm font-black tracking-tight text-white">OF</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-100 font-sans">OrbitFocus</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Executive
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Nuera • GitHub • M365 • Google • Claude</p>
          </div>
        </div>

        {/* Primary View Switcher Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Active Focus Timer Bar */}
        <div className="flex items-center gap-2">
          {/* Active Timer Pill */}
          {timer.taskId ? (
            <div className="flex items-center gap-2 bg-slate-900/95 border border-indigo-500/40 px-2.5 py-1 rounded-xl shadow-lg shadow-indigo-500/10 animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {timer.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      timer.isRunning ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">
                  {timer.mode === 'pomodoro'
                    ? `${Math.floor(timer.secondsRemaining / 60)}:${(timer.secondsRemaining % 60)
                        .toString()
                        .padStart(2, '0')}`
                    : formatDuration(timer.elapsedSeconds)}
                </span>
              </div>

              <div className="h-3 w-[1px] bg-slate-700" />

              <span className="text-[11px] text-slate-300 font-medium max-w-[110px] truncate hidden xl:inline-block">
                {timer.taskTitle}
              </span>

              <button
                onClick={toggleTimer}
                title={timer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={finishTimerAndLog}
                title="Finish Session & Save Log"
                className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setTimerZenMode(true)}
                title="Full-Screen Focus Mode"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:block"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveView('tracking')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Track Time</span>
            </button>
          )}

          {/* Universal Ingestion Button */}
          <button
            onClick={() => setIsIngestionOpen(true)}
            title="Ingest Emails, SMS, Transcripts & Verify Goals"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Ingest Comm</span>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={() => setIsChatWidgetOpen(true)}
            title="AI Goal Copilot (Conversational goal & task management)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition active:scale-95 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">AI Goals</span>
          </button>

          {/* Quick Capture Button */}
          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Capture Task</span>
          </button>

          {/* Command Palette Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Search & Command Palette (Cmd+K)"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center gap-1 text-xs font-mono"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden xl:inline text-slate-500">⌘K</span>
          </button>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={toggleSoundEnabled}
            title={timer.soundEnabled ? 'Mute Sounds' : 'Enable Chimes & Tones'}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
          >
            {timer.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              title="Reminders & Alerts"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition relative"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">Alerts & Reminders</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    Clear All
                  </button>
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No active alerts. All systems aligned.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-left border cursor-pointer transition ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : 'bg-slate-800/70 border-indigo-500/30 hover:border-indigo-500/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex md:hidden items-center justify-between overflow-x-auto gap-1 mt-2 pt-2 border-t border-slate-800/60 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
