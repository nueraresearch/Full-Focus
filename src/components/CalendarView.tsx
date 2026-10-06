import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Play,
  Plus,
  ExternalLink,
  Layers,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadICSFile, getGoogleCalendarUrl, getOutlookCalendarUrl } from '../utils/calendarExport';
import { formatMinutes } from '../utils/prioritization';

export const CalendarView: React.FC = () => {
  const { tasks, calendarEvents, startTimerForTask, setEditingTask, addCalendarEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to change dates
  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  // Get current week days
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay() + 1; // Monday start
    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.setDate(first + i));
      days.push(next);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Combine scheduled tasks with calendar events
  const tasksWithDates = tasks.filter((t) => t.scheduledDate || t.dueDate);

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Calendar & Time-Blocking Grid
          </h1>
          <p className="text-xs text-slate-400">
            Harmonize deep focus blocks with Microsoft 365 Teams meetings and Google Workspace schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  viewMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Export to .ics button */}
          <button
            onClick={() => downloadICSFile(tasks, calendarEvents)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition active:scale-95 cursor-pointer"
            title="Download universal .ics for Apple / Outlook / Google"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export .ics</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Today
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-white ml-2 font-sans">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-slate-400">Deep Focus Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-400">M365 Teams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">Google Meet</span>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      {viewMode === 'week' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full">
          {/* Desktop 7-Col Header */}
          <div className="hidden md:grid md:grid-cols-7 border-b border-slate-800 bg-slate-950/60 divide-x divide-slate-800/60">
            {weekDays.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              return (
                <div key={idx} className="p-3 text-center">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                      isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-200'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time-blocked slots */}
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[420px] w-full">
            {weekDays.map((day, idx) => {
              const dayIso = day.toISOString().split('T')[0];
              const isToday = dayIso === todayStr;
              const dayTasks = tasksWithDates.filter((t) => (t.scheduledDate || t.dueDate?.split('T')[0]) === dayIso);
              const dayEvents = calendarEvents.filter((e) => e.start.startsWith(dayIso));

              return (
                <div key={idx} className="space-y-2 min-h-[140px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 w-full min-w-0">
                  {/* Mobile Day Header */}
                  <div className="md:hidden flex items-center justify-between pb-1.5 border-b border-slate-800/60 font-mono text-xs">
                    <span className="font-bold text-slate-200">
                      {day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                        Today
                      </span>
                    )}
                  </div>
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-slate-200 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] text-blue-400 font-mono mb-1">
                        <span>
                          {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="uppercase">{ev.platform}</span>
                      </div>
                      <div className="font-semibold truncate">{ev.title}</div>
                      {ev.meetingUrl && (
                        <a
                          href={ev.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1 text-[10px] text-sky-400 hover:underline"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  ))}

                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-slate-200 text-xs shadow-sm hover:border-indigo-400 transition"
                    >
                      <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono mb-1">
                        <span>{t.scheduledStartTime || 'Focus'}</span>
                        <span>{formatMinutes(t.estimatedMinutes)}</span>
                      </div>
                      <div
                        onClick={() => setEditingTask(t)}
                        className="font-semibold text-slate-100 hover:text-indigo-300 cursor-pointer truncate"
                      >
                        {t.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          onClick={() => startTimerForTask(t.id)}
                          className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                          title="Start timer for this scheduled block"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                        </button>
                        <a
                          href={getGoogleCalendarUrl(t)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-400 hover:text-white"
                          title="Add to Google Calendar"
                        >
                          + GCal
                        </a>
                      </div>
                    </div>
                  ))}

                  {dayTasks.length === 0 && dayEvents.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-mono py-6">
                      No blocks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Timeline View */}
      {viewMode === 'day' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="divide-y divide-slate-800">
            {hours.map((hour) => {
              const currentIso = currentDate.toISOString().split('T')[0];
              const hourTasks = tasks.filter(
                (t) => (t.scheduledDate || t.dueDate?.split('T')[0]) === currentIso && t.scheduledStartTime?.startsWith(hour.slice(0, 2))
              );

              return (
                <div key={hour} className="py-3 flex items-start gap-4">
                  <span className="font-mono text-xs font-bold text-slate-400 w-14 shrink-0 pt-1">
                    {hour}
                  </span>
                  <div className="flex-1 space-y-2 min-h-[36px]">
                    {hourTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/40 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{t.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Platform: {t.platform.toUpperCase()} • Priority: {t.priority}
                          </div>
                        </div>
                        <button
                          onClick={() => startTimerForTask(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Block</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month Heatmap View */}
      {viewMode === 'month' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
          <h3 className="text-base font-bold text-white mb-2">Month Strategic Deadline Overview</h3>
          <p className="text-xs text-slate-400 mb-6">
            Review delivery milestones across Nuera Research reports and software releases.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tasksWithDates.map((t) => (
              <div
                key={t.id}
                onClick={() => setEditingTask(t)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left hover:border-indigo-500 transition cursor-pointer"
              >
                <div className="text-[10px] font-mono text-indigo-400">
                  {t.scheduledDate || (t.dueDate ? t.dueDate.split('T')[0] : 'Upcoming')}
                </div>
                <div className="text-xs font-bold text-white truncate mt-1">{t.title}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-2 font-mono">
                  {t.platform} • Score {t.priorityScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
