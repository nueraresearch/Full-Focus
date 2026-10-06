import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Check,
  Play,
  Calendar,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Kanban,
  List,
  Clock,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, IntegrationPlatform, Priority } from '../types';
import { getDueDateStatus, formatMinutes } from '../utils/prioritization';
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from '../utils/calendarExport';

export const TasksView: React.FC = () => {
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    toggleSubtask,
    startTimerForTask,
    setEditingTask,
    setIsQuickCaptureOpen,
    selectedPlatformFilter,
    setSelectedPlatformFilter
  } = useApp();

  const [layoutMode, setLayoutMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedPlatformFilter !== 'all' && t.platform !== selectedPlatformFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'border-slate-800' },
    { id: 'todo', label: 'To Do', color: 'border-slate-700' },
    { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500/50' },
    { id: 'review', label: 'Review / QA', color: 'border-amber-500/50' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500/50' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Tasks & Sprint Board
          </h1>
          <p className="text-xs text-slate-400">
            Unified workspace across GitHub PRs, Nuera WordPress drafts, M365 action items, and Claude AI synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition ${
                layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('kanban')}
              className={`p-1.5 rounded-lg transition ${
                layoutMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, tag, or description..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          {/* Platform filter */}
          <select
            value={selectedPlatformFilter}
            onChange={(e) => setSelectedPlatformFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="wordpress">Nuera WordPress</option>
            <option value="github">GitHub</option>
            <option value="claude">Claude AI</option>
            <option value="m365">Microsoft 365</option>
            <option value="google">Google Workspace</option>
            <option value="browser">Browser Tab</option>
          </select>
        </div>
      </div>

      {/* Render List View */}
      {layoutMode === 'list' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No tasks found. Click "New Task" to create one.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const dueStatus = getDueDateStatus(task.dueDate);
                const isExpanded = !!expandedTaskIds[task.id];

                return (
                  <div key={task.id} className="p-4 hover:bg-slate-850/50 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTaskCompleted(task.id)}
                          className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-500'
                              : 'border-slate-600 hover:border-indigo-400'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              onClick={() => setEditingTask(task)}
                              className={`text-sm font-bold cursor-pointer hover:text-indigo-400 transition ${
                                task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                              {task.platform}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                task.priority === 'P1_CRITICAL'
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : task.priority === 'P2_HIGH'
                                  ? 'text-amber-400 bg-amber-500/10'
                                  : 'text-slate-400 bg-slate-800/60'
                              }`}
                            >
                              {task.priority.replace('_', ' ')}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                            <span className={dueStatus.colorClass}>{dueStatus.label}</span>
                            <span>•</span>
                            <span>Est: {formatMinutes(task.estimatedMinutes)}</span>
                            <span>•</span>
                            <span>Tracked: {formatMinutes(task.actualMinutes)}</span>
                            <span>•</span>
                            <span className="text-indigo-400">Score {task.priorityScore}</span>

                            {task.subtasks.length > 0 && (
                              <button
                                onClick={() => toggleExpand(task.id)}
                                className="flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer ml-1"
                              >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <span>
                                  {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                                </span>
                              </button>
                            )}

                            {task.externalRef?.url && (
                              <a
                                href={task.externalRef.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-sky-400 hover:underline"
                              >
                                <span>{task.externalRef.repoName || task.externalRef.postType || 'Open Link'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startTimerForTask(task.id)}
                          title="Start Focus Timer"
                          className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => setEditingTask(task)}
                          title="Edit Task"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks dropdown */}
                    {isExpanded && task.subtasks.length > 0 && (
                      <div className="mt-3 pl-8 pr-2 space-y-1.5 border-t border-slate-800/80 pt-2.5">
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => toggleSubtask(task.id, st.id)}
                            className="flex items-center gap-2 text-xs cursor-pointer text-slate-300 hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => {}}
                              className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                            />
                            <span className={st.completed ? 'line-through text-slate-500' : ''}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Render Kanban Board */}
      {layoutMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`bg-slate-900/80 border ${col.color} rounded-2xl p-3 flex flex-col min-h-[450px] shadow-lg`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const dueStatus = getDueDateStatus(task.dueDate);
                    return (
                      <div
                        key={task.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3 rounded-xl transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-xs font-bold text-slate-100 hover:text-indigo-400 text-left line-clamp-2 cursor-pointer"
                          >
                            {task.title}
                          </button>
                          <button
                            onClick={() => startTimerForTask(task.id)}
                            className="p-1 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white shrink-0 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="uppercase font-mono font-bold text-slate-500">
                            {task.platform}
                          </span>
                          <span className={dueStatus.colorClass}>{dueStatus.label}</span>
                        </div>

                        {/* Move status buttons */}
                        <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                          {col.id !== 'todo' && col.id !== 'backlog' && (
                            <button
                              onClick={() => updateTask(task.id, { status: 'todo' })}
                              className="text-[9px] text-slate-500 hover:text-slate-300"
                            >
                              ← To Do
                            </button>
                          )}
                          {col.id !== 'in_progress' && (
                            <button
                              onClick={() => updateTask(task.id, { status: 'in_progress' })}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              → Progress
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={() => toggleTaskCompleted(task.id)}
                              className="text-[9px] text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              ✓ Done
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
