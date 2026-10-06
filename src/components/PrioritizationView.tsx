import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Filter,
  Check,
  ChevronRight,
  Award,
  Inbox,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, EisenhowerQuadrant, IntegrationPlatform, Priority } from '../types';
import { getDueDateStatus, formatMinutes } from '../utils/prioritization';
import { triggerHaptic } from '../utils/androidBridge';

export const PrioritizationView: React.FC = () => {
  const {
    tasks,
    updateTask,
    toggleTaskCompleted,
    startTimerForTask,
    rebalancePrioritiesWithAI,
    isAIThinking,
    setEditingTask,
    setIsIngestionOpen,
    setIsChatWidgetOpen,
    selectedPlatformFilter,
    setSelectedPlatformFilter
  } = useApp();

  const [frameworkView, setFrameworkView] = useState<'eisenhower' | 'ranked' | 'impact_effort'>('eisenhower');

  // Filter tasks by platform
  const filteredTasks = tasks.filter((t) => {
    if (selectedPlatformFilter === 'all') return true;
    return t.platform === selectedPlatformFilter;
  });

  const activeTasks = filteredTasks.filter((t) => t.status !== 'completed');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  // Group by Eisenhower
  const q1Tasks = activeTasks.filter((t) => t.quadrant === 'DO_FIRST');
  const q2Tasks = activeTasks.filter((t) => t.quadrant === 'SCHEDULE');
  const q3Tasks = activeTasks.filter((t) => t.quadrant === 'DELEGATE');
  const q4Tasks = activeTasks.filter((t) => t.quadrant === 'ELIMINATE');

  // Sorted by calculated priority score descending
  const sortedQueue = [...activeTasks].sort((a, b) => b.priorityScore - a.priorityScore);

  const platformBadge = (platform: IntegrationPlatform) => {
    switch (platform) {
      case 'wordpress':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Nuera WordPress</span>;
      case 'github':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GitHub</span>;
      case 'claude':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Claude AI</span>;
      case 'm365':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">M365</span>;
      case 'google':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Google</span>;
      case 'browser':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Browser Tab</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">General</span>;
    }
  };

  const priorityScoreColor = (score: number) => {
    if (score >= 80) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score >= 40) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Executive Strategy & AI Rebalance Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Executive Prioritization Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Dynamic Focus & Deadline Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Mathematical scoring balances deadline urgency, business impact, and effort. Aligned with Nuera Research publications, GitHub release blockers, and M365 steering deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setIsIngestionOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-bold border border-slate-700/80 transition active:scale-95 cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-sky-400" />
              <span>Ingest Comm</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setIsChatWidgetOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>AI Goal Copilot</span>
            </button>

            <button
              onClick={rebalancePrioritiesWithAI}
              disabled={isAIThinking}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isAIThinking ? 'animate-spin text-amber-300' : 'text-yellow-300'}`} />
              <span>{isAIThinking ? 'Rebalancing...' : 'AI Auto-Rank'}</span>
            </button>
          </div>
        </div>

        {/* Quick Tally Chips */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-rose-400">{q1Tasks.length}</span>
            <span className="text-slate-400">Do First (Urgent)</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-indigo-400">{q2Tasks.length}</span>
            <span className="text-slate-400">Schedule (Strategic)</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-400">{q3Tasks.length}</span>
            <span className="text-slate-400">Delegate / Batch</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">{q4Tasks.length}</span>
            <span className="text-slate-400">Eliminate</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">{completedTasks.length}</span>
            <span className="text-slate-400">Delivered</span>
          </div>
        </div>
      </div>

      {/* Control Filters & View Framework Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Framework Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setFrameworkView('eisenhower')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              frameworkView === 'eisenhower'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Eisenhower Matrix (2x2)
          </button>
          <button
            onClick={() => setFrameworkView('ranked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              frameworkView === 'ranked'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Smart Priority Queue
          </button>
          <button
            onClick={() => setFrameworkView('impact_effort')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              frameworkView === 'impact_effort'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Impact vs Effort
          </button>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Platform:</span>
          </span>
          {(['all', 'wordpress', 'github', 'claude', 'm365', 'google', 'browser'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatformFilter(plat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedPlatformFilter === plat
                  ? 'bg-slate-200 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {plat === 'all'
                ? 'All'
                : plat === 'wordpress'
                ? 'Nuera WP'
                : plat === 'github'
                ? 'GitHub'
                : plat === 'claude'
                ? 'Claude'
                : plat === 'm365'
                ? 'M365'
                : plat === 'google'
                ? 'Google'
                : 'Browser'}
            </button>
          ))}
        </div>
      </div>

      {/* Render View Mode */}
      {frameworkView === 'eisenhower' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Q1: DO FIRST */}
          <EisenhowerQuadrantCard
            title="Q1: DO FIRST"
            subtitle="Urgent & High Impact • Immediate Action Required"
            badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/30"
            borderAccent="border-rose-500/40"
            tasks={q1Tasks}
            onStartFocus={startTimerForTask}
            onToggleComplete={toggleTaskCompleted}
            onSelectTask={setEditingTask}
            onMoveQuadrant={(taskId, quad) => updateTask(taskId, { quadrant: quad })}
          />

          {/* Q2: SCHEDULE / STRATEGIC */}
          <EisenhowerQuadrantCard
            title="Q2: SCHEDULE / DEEP WORK"
            subtitle="High Impact & Strategic • Non-Urgent High Leverage"
            badgeColor="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            borderAccent="border-indigo-500/40"
            tasks={q2Tasks}
            onStartFocus={startTimerForTask}
            onToggleComplete={toggleTaskCompleted}
            onSelectTask={setEditingTask}
            onMoveQuadrant={(taskId, quad) => updateTask(taskId, { quadrant: quad })}
          />

          {/* Q3: DELEGATE / STREAMLINE */}
          <EisenhowerQuadrantCard
            title="Q3: DELEGATE / BATCH"
            subtitle="Urgent & Low Impact • Triage or Streamline"
            badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
            borderAccent="border-amber-500/40"
            tasks={q3Tasks}
            onStartFocus={startTimerForTask}
            onToggleComplete={toggleTaskCompleted}
            onSelectTask={setEditingTask}
            onMoveQuadrant={(taskId, quad) => updateTask(taskId, { quadrant: quad })}
          />

          {/* Q4: ELIMINATE / ARCHIVE */}
          <EisenhowerQuadrantCard
            title="Q4: ELIMINATE / MINIMIZE"
            subtitle="Low Impact & Low Urgency • Deprioritize or Drop"
            badgeColor="bg-slate-700/30 text-slate-400 border-slate-700/50"
            borderAccent="border-slate-800"
            tasks={q4Tasks}
            onStartFocus={startTimerForTask}
            onToggleComplete={toggleTaskCompleted}
            onSelectTask={setEditingTask}
            onMoveQuadrant={(taskId, quad) => updateTask(taskId, { quadrant: quad })}
          />
        </div>
      )}

      {frameworkView === 'ranked' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Smart Priority Ranked Queue</span>
              </h3>
              <p className="text-xs text-slate-400">
                Algorithmically ordered by deadline proximity, impact weight (35%), effort, and objective link.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {sortedQueue.length} Active Items
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {sortedQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No active tasks matching filter. Great job!
              </div>
            ) : (
              sortedQueue.map((task, index) => {
                const dueStatus = getDueDateStatus(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-800/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Rank Index */}
                      <span className="font-mono text-sm font-bold text-slate-500 w-6 pt-0.5">
                        #{index + 1}
                      </span>

                      {/* Complete checkbox */}
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="mt-1 h-5 w-5 rounded-md border border-slate-600 hover:border-emerald-500 flex items-center justify-center transition"
                      >
                        {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-sm font-bold text-slate-100 hover:text-indigo-400 transition text-left truncate cursor-pointer"
                          >
                            {task.title}
                          </button>
                          {platformBadge(task.platform)}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className={`font-mono ${dueStatus.colorClass}`}>
                            {dueStatus.label}
                          </span>
                          <span>•</span>
                          <span>Est: {formatMinutes(task.estimatedMinutes)}</span>
                          <span>•</span>
                          <span>Impact: {task.impact}/5</span>
                          <span>•</span>
                          <span>Quadrant: {task.quadrant.replace('_', ' ')}</span>
                          {task.subtasks.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                Checklist: {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* Score Badge */}
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${priorityScoreColor(
                          task.priorityScore
                        )}`}
                      >
                        Score {task.priorityScore}
                      </div>

                      {/* Start Focus Button */}
                      <button
                        onClick={() => startTimerForTask(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Focus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {frameworkView === 'impact_effort' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Wins (High Impact, Low Effort) */}
          <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">🚀 Quick Wins</span>
                <span className="text-xs text-slate-400">High Impact • Low Effort (Effort ≤ 2)</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {activeTasks.filter((t) => t.impact >= 4 && t.effort <= 2).length}
              </span>
            </div>
            <div className="space-y-2">
              {activeTasks
                .filter((t) => t.impact >= 4 && t.effort <= 2)
                .map((task) => (
                  <TaskMiniCard
                    key={task.id}
                    task={task}
                    onStartFocus={startTimerForTask}
                    onSelectTask={setEditingTask}
                  />
                ))}
            </div>
          </div>

          {/* Major Projects (High Impact, High Effort) */}
          <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 font-bold text-xs">🏛️ Strategic Projects</span>
                <span className="text-xs text-slate-400">High Impact • High Effort (Effort ≥ 3)</span>
              </div>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {activeTasks.filter((t) => t.impact >= 4 && t.effort >= 3).length}
              </span>
            </div>
            <div className="space-y-2">
              {activeTasks
                .filter((t) => t.impact >= 4 && t.effort >= 3)
                .map((task) => (
                  <TaskMiniCard
                    key={task.id}
                    task={task}
                    onStartFocus={startTimerForTask}
                    onSelectTask={setEditingTask}
                  />
                ))}
            </div>
          </div>

          {/* Fill-ins (Low Impact, Low Effort) */}
          <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-bold text-xs">⚡ Fill-Ins</span>
                <span className="text-xs text-slate-400">Low Impact • Low Effort (Batch in gap times)</span>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {activeTasks.filter((t) => t.impact <= 3 && t.effort <= 2).length}
              </span>
            </div>
            <div className="space-y-2">
              {activeTasks
                .filter((t) => t.impact <= 3 && t.effort <= 2)
                .map((task) => (
                  <TaskMiniCard
                    key={task.id}
                    task={task}
                    onStartFocus={startTimerForTask}
                    onSelectTask={setEditingTask}
                  />
                ))}
            </div>
          </div>

          {/* Thankless Tasks (Low Impact, High Effort) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-800 text-slate-400 font-bold text-xs">🛑 High Effort / Low Impact</span>
                <span className="text-xs text-slate-400">Candidate to eliminate or automate</span>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {activeTasks.filter((t) => t.impact <= 3 && t.effort >= 3).length}
              </span>
            </div>
            <div className="space-y-2">
              {activeTasks
                .filter((t) => t.impact <= 3 && t.effort >= 3)
                .map((task) => (
                  <TaskMiniCard
                    key={task.id}
                    task={task}
                    onStartFocus={startTimerForTask}
                    onSelectTask={setEditingTask}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Eisenhower Quadrant Component
interface EisenhowerQuadrantCardProps {
  title: string;
  subtitle: string;
  badgeColor: string;
  borderAccent: string;
  tasks: Task[];
  onStartFocus: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onMoveQuadrant: (id: string, quad: EisenhowerQuadrant) => void;
}

const EisenhowerQuadrantCard: React.FC<EisenhowerQuadrantCardProps> = ({
  title,
  subtitle,
  badgeColor,
  borderAccent,
  tasks,
  onStartFocus,
  onToggleComplete,
  onSelectTask,
  onMoveQuadrant
}) => {
  return (
    <div className={`bg-slate-900/85 border ${borderAccent} rounded-2xl p-4 shadow-xl flex flex-col h-full`}>
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${badgeColor}`}>
              {title}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">({tasks.length})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5 flex-1 min-h-[140px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono py-8">
            Quadrant clear
          </div>
        ) : (
          tasks.map((task) => {
            const dueStatus = getDueDateStatus(task.dueDate);
            return (
              <div
                key={task.id}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="mt-0.5 h-4 w-4 rounded border border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {task.status === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-bold text-slate-100 hover:text-indigo-400 transition text-left truncate block w-full cursor-pointer"
                      >
                        {task.title}
                      </button>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className={`font-mono ${dueStatus.colorClass}`}>{dueStatus.label}</span>
                        <span>•</span>
                        <span>Est: {formatMinutes(task.estimatedMinutes)}</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-400">Score {task.priorityScore}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartFocus(task.id)}
                    title="Focus on this task"
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>

                {/* Subtasks Progress if any */}
                {task.subtasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      {task.subtasks.filter((s) => s.completed).length} of {task.subtasks.length} checklist items
                    </span>
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Mini Card helper for Impact/Effort Matrix
const TaskMiniCard: React.FC<{ task: Task; onStartFocus: (id: string) => void; onSelectTask: (t: Task) => void }> = ({
  task,
  onStartFocus,
  onSelectTask
}) => {
  return (
    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-2 transition">
      <div className="min-w-0 flex-1">
        <button
          onClick={() => onSelectTask(task)}
          className="text-xs font-semibold text-slate-200 hover:text-indigo-400 text-left truncate block w-full cursor-pointer"
        >
          {task.title}
        </button>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
          <span>Impact {task.impact}/5</span>
          <span>•</span>
          <span>Effort {task.effort}/5</span>
          <span>•</span>
          <span className="font-mono text-indigo-400">Score {task.priorityScore}</span>
        </div>
      </div>
      <button
        onClick={() => onStartFocus(task.id)}
        className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition active:scale-95 cursor-pointer shrink-0"
      >
        <Play className="w-3 h-3 fill-current" />
      </button>
    </div>
  );
};
