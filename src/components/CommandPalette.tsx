import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  CheckSquare,
  Calendar,
  Clock,
  Target,
  Share2,
  Sparkles,
  Download,
  Play,
  Plus,
  RefreshCw,
  ExternalLink,
  Bot,
  Inbox
} from 'lucide-react';
import { useApp, ActiveView } from '../context/AppContext';
import { downloadICSFile } from '../utils/calendarExport';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveView,
    tasks,
    calendarEvents,
    startTimerForTask,
    setIsQuickCaptureOpen,
    setIsChatWidgetOpen,
    setIsIngestionOpen,
    rebalancePrioritiesWithAI,
    triggerPlatformSync,
    connections,
    setEditingTask
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter tasks based on query
  const matchingTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.platform.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const actions = [
    {
      id: 'ai_copilot',
      label: 'Open AI Goal Copilot (Set/Modify/Delete Goals)...',
      icon: Bot,
      category: 'Intelligence',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsChatWidgetOpen(true);
      }
    },
    {
      id: 'universal_ingest',
      label: 'Ingest Communication (Emails, SMS, Transcripts & Verify)...',
      icon: Inbox,
      category: 'Intelligence',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsIngestionOpen(true);
      }
    },
    {
      id: 'quick_capture',
      label: 'Capture New Task...',
      icon: Plus,
      category: 'Actions',
      run: () => {
        setIsCommandPaletteOpen(false);
        setIsQuickCaptureOpen(true);
      }
    },
    {
      id: 'ai_rebalance',
      label: 'AI Rebalance All Priorities & Quadrants',
      icon: Sparkles,
      category: 'Intelligence',
      run: () => {
        setIsCommandPaletteOpen(false);
        rebalancePrioritiesWithAI();
      }
    },
    {
      id: 'focus_top',
      label: 'Start Focus on #1 Ranked Task',
      icon: Play,
      category: 'Focus',
      run: () => {
        setIsCommandPaletteOpen(false);
        const topTask = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore)[0];
        if (topTask) startTimerForTask(topTask.id);
      }
    },
    {
      id: 'export_ics',
      label: 'Download Calendar Schedule (.ics)',
      icon: Download,
      category: 'Calendar',
      run: () => {
        setIsCommandPaletteOpen(false);
        downloadICSFile(tasks, calendarEvents);
      }
    },
    {
      id: 'sync_all',
      label: 'Sync All Integrations (Nuera, GitHub, M365)',
      icon: RefreshCw,
      category: 'Integrations',
      run: () => {
        setIsCommandPaletteOpen(false);
        connections.forEach((c) => triggerPlatformSync(c.platform));
      }
    },
    {
      id: 'nav_priorities',
      label: 'Go to Eisenhower Matrix & Prioritization',
      icon: Layers,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('priorities');
      }
    },
    {
      id: 'nav_tasks',
      label: 'Go to Tasks & Kanban Sprint Board',
      icon: CheckSquare,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('tasks');
      }
    },
    {
      id: 'nav_calendar',
      label: 'Go to Calendar & Time-Blocking Grid',
      icon: Calendar,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('calendar');
      }
    },
    {
      id: 'nav_tracking',
      label: 'Go to Time Tracking & Capacity',
      icon: Clock,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('tracking');
      }
    },
    {
      id: 'nav_objectives',
      label: 'Go to Objectives & Deliverables (OKRs)',
      icon: Target,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('objectives');
      }
    },
    {
      id: 'nav_integrations',
      label: 'Go to Integrations Hub',
      icon: Share2,
      category: 'Navigation',
      run: () => {
        setIsCommandPaletteOpen(false);
        setActiveView('integrations');
      }
    }
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, run actions, or navigate (e.g. 'Nuera', 'Focus', 'Sync')..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-850">
          {/* Matching tasks */}
          {matchingTasks.length > 0 && (
            <div className="pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 block">
                Tasks
              </span>
              {matchingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setEditingTask(t);
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-indigo-400">
                      {t.platform}
                    </span>
                    <span className="font-semibold truncate">{t.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    Score {t.priorityScore}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 block">
              Commands
            </span>
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  onClick={action.run}
                  className="px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                    <span>{action.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {action.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
