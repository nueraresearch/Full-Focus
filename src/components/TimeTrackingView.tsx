import React, { useState } from 'react';
import {
  Clock,
  Play,
  Download,
  Plus,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration, formatMinutes } from '../utils/prioritization';
import { IntegrationPlatform, TimeLog } from '../types';

export const TimeTrackingView: React.FC = () => {
  const { timeLogs, tasks, startTimerForTask, addManualTimeLog } = useApp();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState<IntegrationPlatform>('wordpress');
  const [manualMinutes, setManualMinutes] = useState(30);
  const [manualNotes, setManualNotes] = useState('');

  // Calculate total seconds logged
  const totalSecondsLogged = timeLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalHoursLogged = (totalSecondsLogged / 3600).toFixed(1);

  // Group by platform
  const platformTotals: Record<string, number> = {};
  timeLogs.forEach((log) => {
    platformTotals[log.platform] = (platformTotals[log.platform] || 0) + log.durationSeconds;
  });

  const exportCSV = () => {
    const headers = ['Task Title', 'Platform', 'Duration (Minutes)', 'Start Time', 'End Time', 'Notes'];
    const rows = timeLogs.map((l) => [
      `"${l.taskTitle.replace(/"/g, '""')}"`,
      l.platform,
      Math.round(l.durationSeconds / 60),
      l.startTime,
      l.endTime,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orbitfocus-timelogs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    addManualTimeLog({
      taskId: 'manual-' + Date.now(),
      taskTitle: manualTitle.trim(),
      platform: manualPlatform,
      startTime: new Date(Date.now() - manualMinutes * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: manualMinutes * 60,
      notes: manualNotes.trim()
    });

    setIsManualModalOpen(false);
    setManualTitle('');
    setManualNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Time Tracking & Focus Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Measure deep work investment across Nuera Research, GitHub architecture, and executive workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Time Entry</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs font-mono text-slate-400">Total Tracked Focus</span>
          <div className="font-mono text-3xl font-black text-white mt-1">
            {formatDuration(totalSecondsLogged)}
          </div>
          <p className="text-[11px] text-indigo-400 mt-2 font-mono">
            {totalHoursLogged} hours of high-leverage focus
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs font-mono text-slate-400">Daily Target Capacity</span>
          <div className="font-mono text-3xl font-black text-white mt-1">
            6.5 / 8.0 <span className="text-sm text-slate-400 font-normal">hrs</span>
          </div>
          <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full" style={{ width: '81%' }} />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs font-mono text-slate-400">Top Platform Allocation</span>
          <div className="text-xl font-bold text-white mt-1">
            WordPress (Nuera)
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 font-mono">
            42% allocated to primary research deliverables
          </p>
        </div>
      </div>

      {/* Platform Breakdown Bars */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Focus Distribution by Platform</h3>
        <div className="space-y-3">
          {Object.entries(platformTotals).map(([platform, seconds]) => {
            const pct = totalSecondsLogged > 0 ? Math.round((seconds / totalSecondsLogged) * 100) : 0;
            return (
              <div key={platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 uppercase">{platform}</span>
                  <span className="font-mono text-slate-400">
                    {formatDuration(seconds)} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-sm font-bold text-white">Recent Focus Logs</h3>
        </div>

        <div className="divide-y divide-slate-800/80">
          {timeLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No focus logs recorded yet. Start a timer to build your log!
            </div>
          ) : (
            timeLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-850/40 transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{log.taskTitle}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {log.platform}
                    </span>
                  </div>
                  {log.notes && <p className="text-xs text-slate-400">{log.notes}</p>}
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="font-mono text-sm font-bold text-indigo-400 text-right">
                  {formatDuration(log.durationSeconds)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Time Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Manual Time Log</h3>
            <form onSubmit={handleCreateManualLog} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task or Session Name</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Nuera Research draft review..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Platform</label>
                  <select
                    value={manualPlatform}
                    onChange={(e) => setManualPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="wordpress">Nuera WordPress</option>
                    <option value="github">GitHub</option>
                    <option value="claude">Claude AI</option>
                    <option value="m365">Microsoft 365</option>
                    <option value="google">Google Workspace</option>
                    <option value="browser">Browser Research</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Minutes Logged</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Session Notes</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Key outputs or milestones reached..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Record Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
