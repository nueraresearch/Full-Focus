import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  TimeLog,
  Objective,
  CalendarEvent,
  PlatformConnection,
  NotificationItem,
  IntegrationPlatform,
  TaskStatus,
  EisenhowerQuadrant,
  Priority,
  ChatMessage,
  IngestedArtifact
} from '../types';
import {
  initialTasks,
  initialObjectives,
  initialConnections,
  initialCalendarEvents,
  initialTimeLogs
} from '../data/initialData';
import {
  calculatePriorityScore,
  determineEisenhowerQuadrant
} from '../utils/prioritization';
import {
  playStartChime,
  playCompletionChime,
  playAlertChime,
  playTickSound,
  playAmbientSound,
  stopAmbientSound,
  AmbientSoundType
} from '../utils/audio';
import {
  triggerHaptic,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  setAndroidAppBadge,
  sendAndroidNotification
} from '../utils/androidBridge';

export type ActiveView = 
  | 'priorities'   // Eisenhower Matrix & Smart Ranking
  | 'tasks'        // Detailed List & Kanban
  | 'calendar'     // Time Blocking & Schedule
  | 'tracking'     // Time Logs & Capacity Analytics
  | 'objectives'   // OKRs, Deliverables & Roadmap
  | 'integrations'; // Platform Synchronization Hub

interface TimerState {
  taskId: string | null;
  taskTitle: string | null;
  platform: IntegrationPlatform;
  mode: 'pomodoro' | 'stopwatch';
  phase: 'focus' | 'short_break' | 'long_break';
  pomodoroMinutes: number; // default 25
  breakMinutes: number;    // default 5
  elapsedSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  zenMode: boolean;
  soundEnabled: boolean;
}

interface AppContextType {
  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'priorityScore' | 'quadrant'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  rebalancePrioritiesWithAI: () => Promise<void>;
  isAIThinking: boolean;

  // Selected Task for modal
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  isQuickCaptureOpen: boolean;
  setIsQuickCaptureOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Timer & Focus
  timer: TimerState;
  startTimerForTask: (taskId: string, mode?: 'pomodoro' | 'stopwatch') => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  finishTimerAndLog: () => void;
  setTimerAmbient: (sound: AmbientSoundType) => void;
  setTimerZenMode: (zen: boolean) => void;
  toggleSoundEnabled: () => void;
  setTimerConfig: (pomodoroMinutes: number, breakMinutes: number) => void;

  // Time Logs
  timeLogs: TimeLog[];
  addManualTimeLog: (log: Omit<TimeLog, 'id'>) => void;

  // Objectives & Goals
  objectives: Objective[];
  addObjective: (goal: Omit<Objective, 'id'>) => Objective;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;

  // AI Chat Copilot Widget
  isChatWidgetOpen: boolean;
  setIsChatWidgetOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendMessageToAIChat: (msg: string) => Promise<void>;
  isChatSending: boolean;

  // Universal Ingestion Pipeline
  ingestedArtifacts: IngestedArtifact[];
  ingestText: (rawText: string, sourceType?: string) => Promise<IngestedArtifact | null>;
  applyIngestedAction: (artifact: IngestedArtifact) => void;
  isIngesting: boolean;
  isIngestionOpen: boolean;
  setIsIngestionOpen: (open: boolean) => void;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;

  // Integrations
  connections: PlatformConnection[];
  triggerPlatformSync: (platform: IntegrationPlatform) => Promise<void>;
  toggleConnection: (platform: IntegrationPlatform, connected: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Filters & State
  selectedPlatformFilter: IntegrationPlatform | 'all';
  setSelectedPlatformFilter: (platform: IntegrationPlatform | 'all') => void;

  // Android Native Integration
  canInstallAndroid: boolean;
  installAppOnAndroid: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('priorities');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<IntegrationPlatform | 'all'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Android PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installAppOnAndroid = async () => {
    if (!deferredInstallPrompt) return;
    triggerHaptic('tap');
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      triggerHaptic('celebrate');
      setDeferredInstallPrompt(null);
    }
  };

  // LocalStorage initialization
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('orbitfocus_tasks_v2');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('orbitfocus_objectives_v2');
    return saved ? JSON.parse(saved) : initialObjectives;
  });

  const [connections, setConnections] = useState<PlatformConnection[]>(() => {
    const saved = localStorage.getItem('orbitfocus_connections_v2');
    return saved ? JSON.parse(saved) : initialConnections;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('orbitfocus_cal_v2');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('orbitfocus_timelogs_v2');
    return saved ? JSON.parse(saved) : initialTimeLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Nuera Research Editorial Deadline',
      message: 'Next-Gen Foundation Models draft is scheduled for publication today.',
      type: 'deadline',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      title: 'GitHub Pull Request #142',
      message: 'CI build passed for high-throughput event ingestion. Ready for approval.',
      type: 'reminder',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false
    }
  ]);

  // AI Chat Copilot Widget State
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hello! I am your OrbitFocus Executive Co-Pilot. You can conversationally ask me to set new strategic goals, delete or modify existing objectives, reschedule deadlines, or ingest email/chat conversations to verify completed milestones. What are we delivering today?",
      timestamp: new Date().toISOString()
    }
  ]);

  // Universal Ingestion Pipeline State
  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [ingestedArtifacts, setIngestedArtifacts] = useState<IngestedArtifact[]>(() => {
    const saved = localStorage.getItem('orbitfocus_ingested_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Timer State
  const [timer, setTimer] = useState<TimerState>({
    taskId: null,
    taskTitle: null,
    platform: 'general',
    mode: 'pomodoro',
    phase: 'focus',
    pomodoroMinutes: 25,
    breakMinutes: 5,
    elapsedSeconds: 0,
    secondsRemaining: 25 * 60,
    isRunning: false,
    ambientSound: 'none',
    ambientVolume: 0.25,
    zenMode: false,
    soundEnabled: true
  });

  // Android Screen Wake Lock synchronization during timer
  useEffect(() => {
    if (timer.isRunning) {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }
  }, [timer.isRunning]);

  // Android App Badge synchronization with urgent/critical tasks count
  useEffect(() => {
    const criticalCount = tasks.filter((t) => t.priority === 'P1_CRITICAL' && t.status !== 'completed').length;
    setAndroidAppBadge(criticalCount);
  }, [tasks]);

  // Persist items
  useEffect(() => {
    localStorage.setItem('orbitfocus_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('orbitfocus_objectives_v2', JSON.stringify(objectives));
  }, [objectives]);

  useEffect(() => {
    localStorage.setItem('orbitfocus_connections_v2', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('orbitfocus_timelogs_v2', JSON.stringify(timeLogs));
  }, [timeLogs]);

  useEffect(() => {
    localStorage.setItem('orbitfocus_cal_v2', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Keyboard shortcut listener (Cmd/Ctrl + K, Space to toggle timer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timer interval clock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (!prev.isRunning) return prev;

          const newElapsed = prev.elapsedSeconds + 1;

          if (prev.mode === 'stopwatch') {
            return {
              ...prev,
              elapsedSeconds: newElapsed
            };
          }

          // Pomodoro countdown
          const newRemaining = prev.secondsRemaining - 1;
          if (newRemaining <= 0) {
            // Phase transition
            if (prev.phase === 'focus') {
              if (prev.soundEnabled) playAlertChime();
              addNotification({
                title: 'Pomodoro Completed! 🎉',
                message: `Focus interval complete on "${prev.taskTitle || 'Task'}". Take a 5-minute restorative break.`,
                type: 'achievement'
              });
              return {
                ...prev,
                phase: 'short_break',
                secondsRemaining: prev.breakMinutes * 60,
                elapsedSeconds: newElapsed
              };
            } else {
              if (prev.soundEnabled) playStartChime();
              addNotification({
                title: 'Break Finished! ⚡',
                message: 'Break is over. Ready for your next high-impact sprint?',
                type: 'reminder'
              });
              return {
                ...prev,
                phase: 'focus',
                secondsRemaining: prev.pomodoroMinutes * 60,
                elapsedSeconds: newElapsed
              };
            }
          }

          return {
            ...prev,
            elapsedSeconds: newElapsed,
            secondsRemaining: newRemaining
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.soundEnabled]);

  // Ambient sound sync
  useEffect(() => {
    if (timer.isRunning && timer.ambientSound !== 'none') {
      playAmbientSound(timer.ambientSound, timer.ambientVolume);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [timer.isRunning, timer.ambientSound, timer.ambientVolume]);

  // Helper to add task
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'priorityScore' | 'quadrant'>): Task => {
    const id = `task-${Date.now()}`;
    const quadrant = determineEisenhowerQuadrant(taskData.impact, taskData.dueDate, taskData.priority);
    const priorityScore = calculatePriorityScore({
      impact: taskData.impact,
      effort: taskData.effort,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      objectiveId: taskData.objectiveId,
      status: taskData.status
    });

    const newTask: Task = {
      ...taskData,
      id,
      quadrant,
      priorityScore,
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);

    if (taskData.scheduledDate) {
      // Create calendar event entry as well
      const startIso = `${taskData.scheduledDate}T${taskData.scheduledStartTime || '09:00'}:00`;
      const endIso = `${taskData.scheduledDate}T${taskData.scheduledEndTime || '10:00'}:00`;
      addCalendarEvent({
        title: newTask.title,
        platform: newTask.platform,
        start: startIso,
        end: endIso,
        taskId: newTask.id
      });
    }

    addNotification({
      title: 'Task Created & Prioritized',
      message: `"${newTask.title}" added to ${newTask.quadrant.replace('_', ' ')} with score ${priorityScore}/100.`,
      type: 'reminder',
      taskId: newTask.id
    });

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...updates };
        const quadrant = determineEisenhowerQuadrant(merged.impact, merged.dueDate, merged.priority);
        const priorityScore = calculatePriorityScore({
          impact: merged.impact,
          effort: merged.effort,
          dueDate: merged.dueDate,
          priority: merged.priority,
          objectiveId: merged.objectiveId,
          status: merged.status
        });
        return {
          ...merged,
          quadrant,
          priorityScore
        };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (timer.taskId === id) {
      resetTimer();
    }
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const willBeCompleted = t.status !== 'completed';
        const newStatus: TaskStatus = willBeCompleted ? 'completed' : 'todo';
        
        if (willBeCompleted) {
          if (timer.soundEnabled) playCompletionChime();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {
            // ignore
          }
          addNotification({
            title: 'Objective Delivered! 🏆',
            message: `Completed "${t.title}" (${t.platform.toUpperCase()}).`,
            type: 'achievement',
            taskId: t.id
          });
        }

        return {
          ...t,
          status: newStatus,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          priorityScore: willBeCompleted ? 0 : calculatePriorityScore({ ...t, status: newStatus })
        };
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return {
          ...t,
          subtasks: updatedSubs
        };
      })
    );
  };

  const startTimerForTask = (taskId: string, mode: 'pomodoro' | 'stopwatch' = 'pomodoro') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (timer.soundEnabled) playStartChime();

    setTimer((prev) => ({
      ...prev,
      taskId: task.id,
      taskTitle: task.title,
      platform: task.platform,
      mode,
      phase: 'focus',
      secondsRemaining: prev.pomodoroMinutes * 60,
      elapsedSeconds: 0,
      isRunning: true
    }));

    // Move task to 'in_progress' if currently 'todo' or 'backlog'
    if (task.status === 'todo' || task.status === 'backlog') {
      updateTask(task.id, { status: 'in_progress' });
    }
  };

  const toggleTimer = () => {
    setTimer((prev) => {
      const willRun = !prev.isRunning;
      if (willRun && prev.soundEnabled) playStartChime();
      return { ...prev, isRunning: willRun };
    });
  };

  const resetTimer = () => {
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      elapsedSeconds: 0,
      secondsRemaining: prev.pomodoroMinutes * 60
    }));
  };

  const finishTimerAndLog = () => {
    if (!timer.taskId || timer.elapsedSeconds < 10) {
      resetTimer();
      return;
    }

    const durationSec = timer.elapsedSeconds;
    const minutes = Math.ceil(durationSec / 60);

    // Save time log
    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId: timer.taskId,
      taskTitle: timer.taskTitle || 'Untitled Task',
      platform: timer.platform,
      startTime: new Date(Date.now() - durationSec * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: durationSec,
      notes: `Focus session (${timer.mode})`
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    // Update actual minutes on task
    const task = tasks.find((t) => t.id === timer.taskId);
    if (task) {
      updateTask(task.id, {
        actualMinutes: (task.actualMinutes || 0) + minutes
      });
    }

    if (timer.soundEnabled) playCompletionChime();

    addNotification({
      title: 'Time Logged Successfully ⏱️',
      message: `Logged ${minutes} min on "${timer.taskTitle}".`,
      type: 'achievement'
    });

    resetTimer();
  };

  const setTimerAmbient = (sound: AmbientSoundType) => {
    setTimer((prev) => ({ ...prev, ambientSound: sound }));
  };

  const setTimerZenMode = (zen: boolean) => {
    setTimer((prev) => ({ ...prev, zenMode: zen }));
  };

  const toggleSoundEnabled = () => {
    setTimer((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const setTimerConfig = (pomodoroMinutes: number, breakMinutes: number) => {
    setTimer((prev) => ({
      ...prev,
      pomodoroMinutes,
      breakMinutes,
      secondsRemaining: prev.phase === 'focus' ? pomodoroMinutes * 60 : breakMinutes * 60
    }));
  };

  const addManualTimeLog = (log: Omit<TimeLog, 'id'>) => {
    const newLog: TimeLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    setTimeLogs((prev) => [newLog, ...prev]);
  };

  const updateObjective = (id: string, updates: Partial<Objective>) => {
    setObjectives((prev) => prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)));
  };

  const addObjective = (goalData: Omit<Objective, 'id'>): Objective => {
    const newGoal: Objective = {
      ...goalData,
      id: `obj-${Date.now()}`
    };
    setObjectives((prev) => [newGoal, ...prev]);
    triggerHaptic('success');
    addNotification({
      title: 'New Goal Established 🎯',
      message: `Strategic objective "${newGoal.title}" is now active in your roadmap.`,
      type: 'achievement'
    });
    return newGoal;
  };

  const deleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((obj) => obj.id !== id));
    triggerHaptic('medium');
    addNotification({
      title: 'Goal Removed',
      message: 'Strategic objective was deleted from your roadmap.',
      type: 'reminder'
    });
  };

  // Conversational AI Chat Engine
  const sendMessageToAIChat = async (messageText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);
    triggerHaptic('tap');

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: chatMessages.slice(-6),
          currentTasks: tasks,
          currentObjectives: objectives
        })
      });

      if (response.ok) {
        const data = await response.json();
        let actionSummary: ChatMessage['actionTaken'] = undefined;

        // Process any returned actions
        if (data.actions && Array.isArray(data.actions)) {
          for (const act of data.actions) {
            if (act.type === 'create_goal' && act.goal) {
              addObjective(act.goal);
              actionSummary = { type: 'goal_created', details: act.goal.title };
            } else if (act.type === 'update_goal' && act.goalId && act.updates) {
              updateObjective(act.goalId, act.updates);
              actionSummary = { type: 'goal_updated', details: 'Goal updated' };
            } else if (act.type === 'delete_goal' && act.goalId) {
              deleteObjective(act.goalId);
              actionSummary = { type: 'goal_deleted', details: 'Goal deleted' };
            } else if (act.type === 'create_task' && act.task) {
              addTask({
                title: act.task.title || 'New Task',
                description: act.task.description || '',
                platform: act.task.platform || 'general',
                status: 'todo',
                priority: act.task.priority || 'P2_HIGH',
                impact: act.task.impact || 4,
                effort: act.task.effort || 2,
                dueDate: act.task.dueDate,
                estimatedMinutes: act.task.estimatedMinutes || 60,
                actualMinutes: 0,
                tags: act.task.tags || ['ai-chat-created'],
                subtasks: []
              });
              actionSummary = { type: 'task_created', details: act.task.title };
            } else if (act.type === 'complete_task' && act.taskId) {
              toggleTaskCompleted(act.taskId);
              actionSummary = { type: 'task_completed', details: 'Marked completed' };
            } else if (act.type === 'update_task' && act.taskId && act.updates) {
              updateTask(act.taskId, act.updates);
              actionSummary = { type: 'task_updated', details: 'Task details updated' };
            } else if (act.type === 'delete_task' && act.taskId) {
              deleteTask(act.taskId);
            }
          }
        }

        const botReply: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'assistant',
          text: data.reply || "Done! I've updated your workspace accordingly.",
          timestamp: new Date().toISOString(),
          actionTaken: actionSummary
        };
        setChatMessages((prev) => [...prev, botReply]);
        triggerHaptic('success');
      }
    } catch {
      // Local fallback in case network error
      const botReply: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: `I've noted that request: "${messageText}". You can directly configure goals and tasks via the Objectives and Sprint tabs.`,
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, botReply]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Universal Ingestion Engine
  const ingestText = async (rawText: string, sourceType = 'conversation'): Promise<IngestedArtifact | null> => {
    setIsIngesting(true);
    triggerHaptic('tap');
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          sourceType,
          currentTasks: tasks,
          currentObjectives: objectives
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.artifact) {
          setIngestedArtifacts((prev) => [data.artifact, ...prev]);
          localStorage.setItem('orbitfocus_ingested_v1', JSON.stringify([data.artifact, ...ingestedArtifacts]));
          triggerHaptic('celebrate');
          addNotification({
            title: 'Content Ingested & Analyzed 🧠',
            message: `Extracted ${data.artifact.extractedGoals.length} goals, ${data.artifact.extractedTasks.length} tasks, and ${data.artifact.completedVerifications.length} verifications.`,
            type: 'achievement'
          });
          return data.artifact;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsIngesting(false);
    }
  };

  // One-click apply all extracted items from an ingestion artifact
  const applyIngestedAction = (artifact: IngestedArtifact) => {
    triggerHaptic('success');

    // 1. Add extracted goals
    artifact.extractedGoals.forEach((g) => {
      addObjective({
        title: g.title,
        description: g.description || `Extracted from ${artifact.sourceType}`,
        category: g.category || 'Strategic',
        targetDate: g.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        progressPercentage: 0,
        platformFocus: ['general'],
        status: 'on_track'
      });
    });

    // 2. Add extracted tasks
    artifact.extractedTasks.forEach((t) => {
      addTask({
        title: t.title,
        description: t.description || `Ingested from ${artifact.sourceType}`,
        platform: t.platform || 'general',
        status: 'todo',
        priority: t.priority || 'P2_HIGH',
        impact: 4,
        effort: 2,
        dueDate: t.dueDate,
        estimatedMinutes: t.estimatedMinutes || 60,
        actualMinutes: 0,
        tags: t.tags || ['ingested'],
        subtasks: []
      });
    });

    // 3. Apply verifications (e.g. if matched task was hit_and_completed)
    artifact.completedVerifications.forEach((v) => {
      if (v.status === 'hit_and_completed' && v.matchedTaskId) {
        const target = tasks.find((t) => t.id === v.matchedTaskId);
        if (target && target.status !== 'completed') {
          toggleTaskCompleted(target.id);
        }
      }
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    addNotification({
      title: 'Ingestion Changes Applied! ⚡',
      message: 'All extracted goals, tasks, and status verifications synced to your workspace.',
      type: 'achievement'
    });
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${Date.now()}`
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  const triggerPlatformSync = async (platform: IntegrationPlatform) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.platform === platform ? { ...c, statusText: 'Synchronizing in real-time...' } : c
      )
    );

    // Simulate real sync latency & API pull
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const syncTimestamp = new Date().toISOString();

    setConnections((prev) =>
      prev.map((c) => {
        if (c.platform !== platform) return c;
        let status = 'Sync successful. All active items up-to-date.';
        if (platform === 'wordpress') status = 'Fetched latest posts & draft revisions from nueraresearch.com';
        if (platform === 'github') status = 'Synchronized PRs, issues & status checks with GitHub';
        if (platform === 'claude') status = 'Claude AI prompt bridge and reasoning templates refreshed';
        if (platform === 'm365') status = 'Outlook schedule and Teams tasks fully aligned';
        if (platform === 'google') status = 'Google Workspace calendar & action items synchronized';
        if (platform === 'browser') status = 'Chrome/Edge active tab queue ingested into backlog';

        return {
          ...c,
          lastSyncedAt: syncTimestamp,
          statusText: status,
          details: {
            ...c.details,
            pendingItemsCount: Math.floor(Math.random() * 2)
          }
        };
      })
    );

    addNotification({
      title: `${platform.toUpperCase()} Synchronization Complete`,
      message: `Fresh state synchronized with OrbitFocus.`,
      type: 'sync'
    });
  };

  const toggleConnection = (platform: IntegrationPlatform, connected: boolean) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.platform === platform
          ? {
              ...c,
              connected,
              statusText: connected ? 'Connected & ready' : 'Disconnected by user'
            }
          : c
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // AI-Powered Prioritization Engine (calls /api/prioritize or local heuristic fallback)
  const rebalancePrioritiesWithAI = async () => {
    setIsAIThinking(true);
    try {
      const response = await fetch('/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, objectives })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rankedTasks && Array.isArray(data.rankedTasks)) {
          // Merge AI recommendations
          setTasks((prev) =>
            prev.map((t) => {
              const matched = data.rankedTasks.find((item: any) => item.id === t.id);
              if (matched) {
                return {
                  ...t,
                  priorityScore: matched.priorityScore ?? t.priorityScore,
                  quadrant: matched.quadrant ?? t.quadrant,
                  priority: matched.priority ?? t.priority
                };
              }
              return t;
            })
          );
        }
      } else {
        // Fallback heuristic rebalancing
        rebalanceLocalHeuristics();
      }
    } catch {
      // Local fallback
      rebalanceLocalHeuristics();
    } finally {
      setIsAIThinking(false);
      if (timer.soundEnabled) playCompletionChime();
      addNotification({
        title: 'Priorities AI-Optimized 🚀',
        message: 'Rebalanced task scores, urgency weights, and Eisenhower quadrants.',
        type: 'achievement'
      });
    }
  };

  const rebalanceLocalHeuristics = () => {
    setTasks((prev) =>
      prev.map((t) => {
        const quad = determineEisenhowerQuadrant(t.impact, t.dueDate, t.priority);
        const score = calculatePriorityScore({
          impact: t.impact,
          effort: t.effort,
          dueDate: t.dueDate,
          priority: t.priority,
          objectiveId: t.objectiveId,
          status: t.status
        });
        return {
          ...t,
          quadrant: quad,
          priorityScore: score
        };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        toggleSubtask,
        rebalancePrioritiesWithAI,
        isAIThinking,
        editingTask,
        setEditingTask,
        isQuickCaptureOpen,
        setIsQuickCaptureOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        timer,
        startTimerForTask,
        toggleTimer,
        resetTimer,
        finishTimerAndLog,
        setTimerAmbient,
        setTimerZenMode,
        toggleSoundEnabled,
        setTimerConfig,
        timeLogs,
        addManualTimeLog,
        objectives,
        addObjective,
        updateObjective,
        deleteObjective,
        isChatWidgetOpen,
        setIsChatWidgetOpen,
        chatMessages,
        sendMessageToAIChat,
        isChatSending,
        ingestedArtifacts,
        ingestText,
        applyIngestedAction,
        isIngesting,
        isIngestionOpen,
        setIsIngestionOpen,
        calendarEvents,
        addCalendarEvent,
        connections,
        triggerPlatformSync,
        toggleConnection,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        addNotification,
        selectedPlatformFilter,
        setSelectedPlatformFilter,
        canInstallAndroid: !!deferredInstallPrompt,
        installAppOnAndroid
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
