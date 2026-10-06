import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Layers,
  ArrowUpRight,
  Trash2,
  Inbox,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Objective } from '../types';
import { triggerHaptic } from '../utils/androidBridge';

export const ObjectivesView: React.FC = () => {
  const {
    objectives,
    updateObjective,
    deleteObjective,
    tasks,
    setIsChatWidgetOpen,
    setIsIngestionOpen
  } = useApp();
  const [isNewObjectiveOpen, setIsNewObjectiveOpen] = useState(false);

  // Velocity metrics
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const statusBadge = (status: Objective['status']) => {
    switch (status) {
      case 'on_track':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">On Track</span>;
      case 'at_risk':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">At Risk</span>;
      case 'behind':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">Behind</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">Completed</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Strategic Objectives & Delivery Velocity
          </h1>
          <p className="text-xs text-slate-400">
            High-level OKRs driving Nuera Research publications, engineering architecture, and enterprise milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setIsIngestionOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-semibold border border-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5 text-sky-400" />
            <span>Ingest Comm</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setIsChatWidgetOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition active:scale-95 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Set Goal</span>
          </button>

          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            Delivery Velocity: 84%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Sprint Delivery Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-black text-white mt-1">
            {completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {completedTasksCount} of {totalTasksCount} sprint deliverables completed
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Focus Discipline Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-black text-white mt-1">
            92 / 100
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 font-mono">
            Low context switching, solid Pomodoro completion
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Next Major Milestone</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white mt-1 truncate">
            Nuera Research Q4 Paper
          </div>
          <p className="text-[11px] text-indigo-400 mt-2 font-mono">
            Target delivery in 5 days
          </p>
        </div>
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.map((obj) => {
          const linkedTasks = tasks.filter((t) => t.objectiveId === obj.id);
          const completedLinked = linkedTasks.filter((t) => t.status === 'completed').length;

          return (
            <div
              key={obj.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                      [{obj.category}]
                    </span>
                    <h3 className="text-base font-bold text-white">{obj.title}</h3>
                    {statusBadge(obj.status)}
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">{obj.description}</p>
                </div>

                <div className="flex items-center gap-4 self-end lg:self-center">
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400">Target Date</span>
                    <div className="text-xs font-bold text-slate-200 font-mono">
                      {new Date(obj.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="w-32 text-right">
                    <span className="text-xs font-mono text-slate-400">{obj.progressPercentage}% Complete</span>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                        style={{ width: `${obj.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Tasks snippet */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Linked Tasks:</span>
                  <span>
                    {completedLinked} of {linkedTasks.length} delivered
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">Platforms:</span>
                  {obj.platformFocus.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-950 text-slate-300 border border-slate-800">
                      {p}
                    </span>
                  ))}

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setIsChatWidgetOpen(true);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition cursor-pointer"
                    >
                      AI Edit
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        deleteObjective(obj.id);
                      }}
                      title="Delete Goal"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
