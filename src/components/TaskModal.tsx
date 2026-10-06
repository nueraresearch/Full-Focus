import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority, EisenhowerQuadrant, IntegrationPlatform, Subtask } from '../types';
import { calculatePriorityScore, determineEisenhowerQuadrant } from '../utils/prioritization';
import { parseQuickCaptureText } from '../utils/extensionGenerator';

export const TaskModal: React.FC = () => {
  const {
    isQuickCaptureOpen,
    setIsQuickCaptureOpen,
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    objectives
  } = useApp();

  const isOpen = isQuickCaptureOpen || editingTask !== null;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<IntegrationPlatform>('wordpress');
  const [priority, setPriority] = useState<Priority>('P2_HIGH');
  const [impact, setImpact] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [effort, setEffort] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [dueDate, setDueDate] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('10:00');
  const [scheduledEndTime, setScheduledEndTime] = useState('11:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [objectiveId, setObjectiveId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync editing task
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPlatform(editingTask.platform);
      setPriority(editingTask.priority);
      setImpact(editingTask.impact);
      setEffort(editingTask.effort);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 16) : '');
      setScheduledDate(editingTask.scheduledDate || '');
      setScheduledStartTime(editingTask.scheduledStartTime || '10:00');
      setScheduledEndTime(editingTask.scheduledEndTime || '11:00');
      setEstimatedMinutes(editingTask.estimatedMinutes || 60);
      setObjectiveId(editingTask.objectiveId || '');
      setExternalUrl(editingTask.externalRef?.url || '');
      setTagsInput(editingTask.tags.join(', '));
      setSubtasks(editingTask.subtasks || []);
    } else {
      // Reset for quick capture
      setTitle('');
      setDescription('');
      setPlatform('wordpress');
      setPriority('P2_HIGH');
      setImpact(4);
      setEffort(2);
      setDueDate('');
      setScheduledDate('');
      setScheduledStartTime('10:00');
      setScheduledEndTime('11:00');
      setEstimatedMinutes(60);
      setObjectiveId(objectives[0]?.id || '');
      setExternalUrl('');
      setTagsInput('');
      setSubtasks([]);
    }
  }, [editingTask, isQuickCaptureOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsQuickCaptureOpen(false);
    setEditingTask(null);
  };

  // Quick URL paste listener
  const handleTitleBlur = () => {
    if (!editingTask && (title.startsWith('http://') || title.startsWith('https://'))) {
      const parsed = parseQuickCaptureText(title);
      setTitle(parsed.title);
      setPlatform(parsed.platform);
      setPriority(parsed.suggestedPriority);
      if (parsed.url) setExternalUrl(parsed.url);
      if (parsed.tags.length > 0) setTagsInput(parsed.tags.join(', '));
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Preview live priority score & quadrant
  const previewScore = calculatePriorityScore({
    impact,
    effort,
    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    priority,
    objectiveId,
    status: editingTask ? editingTask.status : 'todo'
  });

  const previewQuadrant = determineEisenhowerQuadrant(
    impact,
    dueDate ? new Date(dueDate).toISOString() : undefined,
    priority
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const externalRef = externalUrl.trim()
      ? {
          platform,
          url: externalUrl.trim()
        }
      : undefined;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        platform,
        priority,
        impact,
        effort,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        scheduledDate: scheduledDate || undefined,
        scheduledStartTime: scheduledDate ? scheduledStartTime : undefined,
        scheduledEndTime: scheduledDate ? scheduledEndTime : undefined,
        estimatedMinutes,
        objectiveId: objectiveId || undefined,
        tags,
        subtasks,
        externalRef
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        platform,
        priority,
        status: 'todo',
        impact,
        effort,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        scheduledDate: scheduledDate || undefined,
        scheduledStartTime: scheduledDate ? scheduledStartTime : undefined,
        scheduledEndTime: scheduledDate ? scheduledEndTime : undefined,
        estimatedMinutes,
        actualMinutes: 0,
        objectiveId: objectiveId || undefined,
        tags,
        subtasks,
        externalRef
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-base font-bold text-white">
              {editingTask ? 'Edit Task & Priorities' : 'Capture New Work Deliverable'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Task Title or URL
            </label>
            <input
              autoFocus
              type="text"
              required
              value={title}
              onBlur={handleTitleBlur}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Publish Nuera Research whitepaper or paste GitHub PR / arXiv link..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Executive Context / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deliverable specifications, benchmark requirements, or review notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Platform and Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Integration Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="wordpress">WordPress (nueraresearch.com)</option>
                <option value="github">GitHub Enterprise & PRs</option>
                <option value="claude">Claude AI Workspace</option>
                <option value="m365">Microsoft 365 (Outlook/Teams)</option>
                <option value="google">Google Workspace</option>
                <option value="browser">Chrome / Edge Research Tab</option>
                <option value="general">General Operations</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="P1_CRITICAL">P1 - Critical (Immediate Blocker)</option>
                <option value="P2_HIGH">P2 - High (Important Sprint Item)</option>
                <option value="P3_MEDIUM">P3 - Medium (Standard Deliverable)</option>
                <option value="P4_LOW">P4 - Low (Nice to Have)</option>
              </select>
            </div>
          </div>

          {/* Impact and Effort Sliders with Dynamic Score Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Mathematical Priority Engine</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">
                  Score: {previewScore}/100
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  {previewQuadrant.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Impact (Strategic Value)</span>
                  <span className="font-bold text-white">{impact} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value) as any)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Effort (Time / Cognitive Load)</span>
                  <span className="font-bold text-white">{effort} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value) as any)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Due date and Time Allocation row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hard Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Calendar Schedule Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Estimated Focus (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="600"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Link to Strategic Objective */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Strategic Objective / OKR
              </label>
              <select
                value={objectiveId}
                onChange={(e) => setObjectiveId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">None (Independent task)</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reference URL (GitHub / WP / Doc)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks checklist builder */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Checklist & Subtasks ({subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-950 text-xs">
                  <span className="text-slate-300 truncate">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask and press Enter..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              {editingTask ? 'Save Changes' : 'Create & Prioritize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
