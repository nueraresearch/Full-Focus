export type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type EisenhowerQuadrant = 
  | 'DO_FIRST'      // Urgent & Important (Q1)
  | 'SCHEDULE'      // Not Urgent & Important (Q2)
  | 'DELEGATE'      // Urgent & Not Important (Q3)
  | 'ELIMINATE';    // Not Urgent & Not Important (Q4)

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';

export type IntegrationPlatform = 
  | 'github' 
  | 'wordpress' 
  | 'm365' 
  | 'google' 
  | 'browser' 
  | 'claude'
  | 'general';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  quadrant: EisenhowerQuadrant;
  status: TaskStatus;
  platform: IntegrationPlatform;
  
  // Scoring
  impact: 1 | 2 | 3 | 4 | 5; // 1 lowest, 5 highest
  effort: 1 | 2 | 3 | 4 | 5; // 1 lowest (quick win), 5 highest (heavy lift)
  priorityScore: number;     // 0 - 100 calculated dynamically
  
  // Deadlines & Scheduling
  dueDate?: string; // ISO date-time
  scheduledDate?: string; // Date string YYYY-MM-DD
  scheduledStartTime?: string; // HH:mm
  scheduledEndTime?: string; // HH:mm
  estimatedMinutes: number;
  actualMinutes: number;
  
  // Deliverable & Objective link
  objectiveId?: string;
  tags: string[];
  subtasks: Subtask[];
  
  // Platform-specific external metadata
  externalRef?: {
    platform: IntegrationPlatform;
    externalId?: string;
    url?: string;
    repoName?: string;         // GitHub
    postType?: string;         // WordPress (nuera research)
    postStatus?: string;       // draft, scheduled, published
    meetingLink?: string;      // M365 Teams / Google Meet
    browserTabUrl?: string;    // Chrome/Edge
    browserTabTitle?: string;
    claudePromptType?: string; // Claude (Research, Code, Review, Draft)
  };
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
  reminderMinutesBefore?: number; // e.g. 15, 60, 1440
}

export interface TimeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  platform: IntegrationPlatform;
  startTime: string; // ISO
  endTime: string;   // ISO
  durationSeconds: number;
  notes?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  category: 'Strategic' | 'Engineering' | 'Research' | 'Operations';
  targetDate: string;
  progressPercentage: number;
  platformFocus: IntegrationPlatform[];
  status: 'on_track' | 'at_risk' | 'completed' | 'behind';
}

export interface CalendarEvent {
  id: string;
  title: string;
  platform: IntegrationPlatform;
  start: string; // ISO
  end: string;   // ISO
  allDay?: boolean;
  taskId?: string;
  meetingUrl?: string;
  location?: string;
}

export interface PlatformConnection {
  platform: IntegrationPlatform;
  name: string;
  connected: boolean;
  lastSyncedAt?: string;
  statusText: string;
  details: {
    accountName?: string;
    repoCount?: number;
    siteUrl?: string;
    pendingItemsCount?: number;
    syncIntervalMinutes?: number;
    tokenPreview?: string;
  };
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'sync' | 'achievement';
  timestamp: string;
  read: boolean;
}

export interface IngestedArtifact {
  id: string;
  sourceType: 'email' | 'sms' | 'conversation' | 'claude_chat' | 'teams_slack' | 'meeting_transcript' | 'external_ai';
  senderOrParticipant?: string;
  rawText: string;
  timestamp: string;
  extractedGoals: Array<{
    title: string;
    description?: string;
    category: 'Strategic' | 'Engineering' | 'Research' | 'Operations';
    targetDate?: string;
    confidence: number;
  }>;
  extractedTasks: Array<{
    title: string;
    description?: string;
    platform: IntegrationPlatform;
    priority: Priority;
    dueDate?: string;
    estimatedMinutes: number;
    tags?: string[];
  }>;
  completedVerifications: Array<{
    matchedTaskId?: string;
    matchedTaskTitle?: string;
    matchedObjectiveId?: string;
    status: 'hit_and_completed' | 'on_track' | 'deadline_risk' | 'blocked';
    evidenceSnippet: string;
    recommendedAction: string;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTaken?: {
    type: 'goal_created' | 'goal_updated' | 'goal_deleted' | 'task_created' | 'task_updated' | 'task_completed' | 'deadline_rescheduled' | 'ingested';
    details?: string;
    count?: number;
  };
}

