import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Target,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/androidBridge';

export const AIChatWidget: React.FC = () => {
  const {
    isChatWidgetOpen,
    setIsChatWidgetOpen,
    chatMessages,
    sendMessageToAIChat,
    isChatSending,
    objectives,
    tasks
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatWidgetOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatWidgetOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatSending) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    await sendMessageToAIChat(msg);
  };

  const quickPrompts = [
    { label: '🎯 Set Goal: Nuera Q4 Launch', prompt: 'Set a new strategic goal: "Launch Nuera Research Q4 Autonomous Systems Paper" due next Friday.' },
    { label: '⚡ Add Task: Review PR #142', prompt: 'Create a P1 Critical task for GitHub: "Review and merge PR #142" due tomorrow at 3pm.' },
    { label: '🗑️ Delete Goal', prompt: `Delete the goal "${objectives[objectives.length - 1]?.title || 'last goal'}"` },
    { label: '📅 Reschedule Deadline', prompt: 'Reschedule my highest priority task to tomorrow.' },
    { label: '✅ Mark Task Completed', prompt: `Mark task "${tasks[0]?.title || 'current task'}" as completed.` }
  ];

  if (!isChatWidgetOpen) {
    return (
      <button
        onClick={() => {
          triggerHaptic('tap');
          setIsChatWidgetOpen(true);
        }}
        aria-label="Open AI Goal Copilot"
        className="fixed bottom-20 md:bottom-6 right-20 md:right-6 z-40 h-13 w-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-400 text-white shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
        title="Open AI Goal Copilot"
      >
        <Bot className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
        isExpanded
          ? 'inset-3 sm:inset-6 md:inset-12'
          : 'bottom-2 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto w-auto sm:w-[420px] max-w-[calc(100vw-16px)] h-[84vh] sm:h-[580px]'
      }`}
    >
      {/* Widget Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 rounded-t-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1px] shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">AI Executive Co-Pilot</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                Goals & Sprints
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Set, modify, or delete goals & tasks conversationally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:block"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setIsChatWidgetOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] p-3 rounded-2xl break-words ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* Executed Action Badge */}
                {msg.actionTaken && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Action Applied: {msg.actionTaken.details || msg.actionTaken.type}</span>
                  </div>
                )}
              </div>

              <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isChatSending && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>AI Co-Pilot is updating goals & workspace...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              triggerHaptic('tap');
              sendMessageToAIChat(q.prompt);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800/80 whitespace-nowrap transition cursor-pointer active:scale-95"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask to set/delete goals, reschedule, or complete tasks..."
          className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isChatSending}
          className="h-8.5 w-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
