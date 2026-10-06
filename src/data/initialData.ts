import { Task, Objective, CalendarEvent, PlatformConnection, TimeLog } from '../types';
import { calculatePriorityScore, determineEisenhowerQuadrant } from '../utils/prioritization';

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const inHours = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86400 * 1000).toISOString();

export const initialObjectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'Publish Nuera Research Q4 Autonomous Systems Intelligence Report',
    description: 'Comprehensive research paper and multi-part executive analysis on nueraresearch.com',
    category: 'Research',
    targetDate: inDays(5).split('T')[0],
    progressPercentage: 68,
    platformFocus: ['wordpress', 'claude'],
    status: 'on_track'
  },
  {
    id: 'obj-2',
    title: 'Deploy Production Core Architecture & API Gateway v2.4',
    description: 'Merge mission-critical GitHub pull requests, finalize automated CI pipeline, and audit security',
    category: 'Engineering',
    targetDate: inDays(3).split('T')[0],
    progressPercentage: 82,
    platformFocus: ['github'],
    status: 'on_track'
  },
  {
    id: 'obj-3',
    title: 'Enterprise Q4 Partner Deliverables & Stakeholder Sign-Off',
    description: 'Coordinate Microsoft 365 executive briefings and Google Workspace shared roadmaps',
    category: 'Strategic',
    targetDate: inDays(10).split('T')[0],
    progressPercentage: 45,
    platformFocus: ['m365', 'google'],
    status: 'at_risk'
  }
];

const rawTasks: Array<Omit<Task, 'priorityScore' | 'quadrant'>> = [
  {
    id: 'task-1',
    title: 'Finalize & Publish "Next-Gen Foundation Models" Whitepaper Draft',
    description: 'Complete the editorial review for Nuera Research, integrate technical charts, and schedule post in WordPress CMS for public distribution.',
    priority: 'P1_CRITICAL',
    status: 'in_progress',
    platform: 'wordpress',
    impact: 5,
    effort: 3,
    dueDate: inHours(6),
    scheduledDate: todayStr,
    scheduledStartTime: '10:00',
    scheduledEndTime: '12:00',
    estimatedMinutes: 120,
    actualMinutes: 45,
    objectiveId: 'obj-1',
    tags: ['nuera-research', 'editorial', 'p1-deadline'],
    subtasks: [
      { id: 'st-1', title: 'Verify WordPress meta tags & SEO focus keyword', completed: true },
      { id: 'st-2', title: 'Insert benchmark graphs into WordPress editor', completed: true },
      { id: 'st-3', title: 'Final proofread of Nuera Research executive abstract', completed: false },
      { id: 'st-4', title: 'Schedule publish date on nueraresearch.com', completed: false },
    ],
    externalRef: {
      platform: 'wordpress',
      url: 'https://nueraresearch.com/wp-admin/post.php?post=1042&action=edit',
      postType: 'Research Paper',
      postStatus: 'draft'
    },
    createdAt: inDays(-2),
    reminderMinutesBefore: 60
  },
  {
    id: 'task-2',
    title: 'Review and Merge GitHub PR #142: High-Throughput Event Ingestion',
    description: 'Conduct code review, inspect CI performance tests, and approve pull request for production release.',
    priority: 'P1_CRITICAL',
    status: 'todo',
    platform: 'github',
    impact: 5,
    effort: 2,
    dueDate: inHours(14),
    scheduledDate: todayStr,
    scheduledStartTime: '14:00',
    scheduledEndTime: '15:30',
    estimatedMinutes: 90,
    actualMinutes: 0,
    objectiveId: 'obj-2',
    tags: ['github', 'pull-request', 'code-review'],
    subtasks: [
      { id: 'st-21', title: 'Review diff in core worker loop', completed: false },
      { id: 'st-22', title: 'Verify GitHub Actions test suite pass', completed: false },
      { id: 'st-23', title: 'Merge and trigger staging rollout', completed: false },
    ],
    externalRef: {
      platform: 'github',
      repoName: 'nuera-core/gateway-service',
      url: 'https://github.com/nuera-core/gateway-service/pull/142',
      externalId: 'PR #142'
    },
    createdAt: inDays(-1),
    reminderMinutesBefore: 30
  },
  {
    id: 'task-3',
    title: 'Run Claude 3.7 Synthesis on Market Research Data & Competitor Moats',
    description: 'Generate deep prompt brief for Claude analyzing 40-page competitive intelligence deck, then distill action items into OrbitFocus.',
    priority: 'P2_HIGH',
    status: 'in_progress',
    platform: 'claude',
    impact: 4,
    effort: 2,
    dueDate: inHours(28),
    scheduledDate: todayStr,
    scheduledStartTime: '16:00',
    scheduledEndTime: '17:00',
    estimatedMinutes: 60,
    actualMinutes: 20,
    objectiveId: 'obj-1',
    tags: ['claude-ai', 'synthesis', 'intelligence'],
    subtasks: [
      { id: 'st-31', title: 'Assemble raw transcripts into Claude prompt brief', completed: true },
      { id: 'st-32', title: 'Run Claude deep reasoning iteration', completed: false },
      { id: 'st-33', title: 'Import synthesized action items into deliverables', completed: false },
    ],
    externalRef: {
      platform: 'claude',
      url: 'https://claude.ai/chat/prompt-analysis',
      claudePromptType: 'Deep Research Synthesis'
    },
    createdAt: inDays(-1),
    reminderMinutesBefore: 60
  },
  {
    id: 'task-4',
    title: 'Prepare Microsoft 365 Executive Steering Deck & Review Teams Action Items',
    description: 'Sync PowerPoint deck with latest progress metrics and compile follow-up tasks from Teams meetings.',
    priority: 'P2_HIGH',
    status: 'todo',
    platform: 'm365',
    impact: 4,
    effort: 3,
    dueDate: inDays(2),
    estimatedMinutes: 90,
    actualMinutes: 0,
    objectiveId: 'obj-3',
    tags: ['m365', 'outlook', 'teams', 'steering'],
    subtasks: [
      { id: 'st-41', title: 'Export monthly burn rate & delivery velocity chart', completed: false },
      { id: 'st-42', title: 'Sync slides to OneDrive cloud folder', completed: false },
    ],
    externalRef: {
      platform: 'm365',
      url: 'https://outlook.office.com/mail',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3asteering'
    },
    createdAt: inDays(-3),
    reminderMinutesBefore: 120
  },
  {
    id: 'task-5',
    title: 'Review Google Workspace Shared Roadmap & Consolidate Sprint Goals',
    description: 'Ensure quarterly engineering priorities align with marketing release calendar in Google Docs and Google Sheets.',
    priority: 'P3_MEDIUM',
    status: 'todo',
    platform: 'google',
    impact: 3,
    effort: 2,
    dueDate: inDays(3),
    estimatedMinutes: 45,
    actualMinutes: 0,
    objectiveId: 'obj-3',
    tags: ['google-workspace', 'docs', 'roadmap'],
    subtasks: [
      { id: 'st-51', title: 'Audit comments on Q4 Master Sheet', completed: false },
      { id: 'st-52', title: 'Resolve outstanding permission requests', completed: false },
    ],
    externalRef: {
      platform: 'google',
      url: 'https://docs.google.com/document/d/shared-roadmap',
      meetingLink: 'https://meet.google.com/xyz-abc-def'
    },
    createdAt: inDays(-4)
  },
  {
    id: 'task-6',
    title: 'Triage Captured Browser Research Tabs & Chrome Reading Queue',
    description: 'Organize 8 bookmarked engineering benchmarks and papers into Nuera Research library.',
    priority: 'P3_MEDIUM',
    status: 'backlog',
    platform: 'browser',
    impact: 3,
    effort: 2,
    dueDate: inDays(4),
    estimatedMinutes: 40,
    actualMinutes: 0,
    objectiveId: 'obj-1',
    tags: ['chrome', 'research', 'bookmarks'],
    subtasks: [
      { id: 'st-61', title: 'Extract latency metrics from IEEE paper tab', completed: false },
      { id: 'st-62', title: 'Archive processed tabs', completed: false },
    ],
    externalRef: {
      platform: 'browser',
      browserTabUrl: 'https://arxiv.org/abs/2403.01234',
      browserTabTitle: 'Scalable Distributed Architectures for Real-Time Workflows'
    },
    createdAt: inDays(-2)
  },
  {
    id: 'task-7',
    title: 'Address GitHub Dependabot Security Advisory in Auth Service',
    description: 'Bump JWT validation dependency to patch CVE-2024-xxxx and deploy hotfix.',
    priority: 'P1_CRITICAL',
    status: 'todo',
    platform: 'github',
    impact: 5,
    effort: 1,
    dueDate: inHours(8),
    estimatedMinutes: 30,
    actualMinutes: 0,
    objectiveId: 'obj-2',
    tags: ['github', 'security', 'cve'],
    subtasks: [
      { id: 'st-71', title: 'Update package.json and run lockfile audit', completed: false },
      { id: 'st-72', title: 'Verify backward compatibility with M365 SSO', completed: false },
    ],
    externalRef: {
      platform: 'github',
      repoName: 'nuera-core/auth-service',
      url: 'https://github.com/nuera-core/auth-service/security/dependabot/12'
    },
    createdAt: inDays(-1),
    reminderMinutesBefore: 30
  }
];

export const initialTasks: Task[] = rawTasks.map((t) => {
  const quadrant = determineEisenhowerQuadrant(t.impact, t.dueDate, t.priority);
  const priorityScore = calculatePriorityScore({
    impact: t.impact,
    effort: t.effort,
    dueDate: t.dueDate,
    priority: t.priority,
    objectiveId: t.objectiveId,
    status: t.status
  });
  return {
    ...t,
    quadrant,
    priorityScore
  };
});

export const initialConnections: PlatformConnection[] = [
  {
    platform: 'wordpress',
    name: 'WordPress (nueraresearch.com)',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    statusText: 'Connected to nueraresearch.com REST API (v2)',
    details: {
      siteUrl: 'https://nueraresearch.com',
      pendingItemsCount: 3,
      syncIntervalMinutes: 15,
      tokenPreview: 'wp_app_****9a4f'
    }
  },
  {
    platform: 'github',
    name: 'GitHub Enterprise & Cloud',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    statusText: '2 PRs awaiting review, 1 security alert',
    details: {
      accountName: 'nuera-core',
      repoCount: 6,
      pendingItemsCount: 4,
      syncIntervalMinutes: 5,
      tokenPreview: 'ghp_****3f81'
    }
  },
  {
    platform: 'claude',
    name: 'Claude AI Workspace (Anthropic)',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    statusText: 'Briefing generator & prompt bridge ready',
    details: {
      accountName: 'claude.ai / nuera-research',
      pendingItemsCount: 2,
      syncIntervalMinutes: 30
    }
  },
  {
    platform: 'm365',
    name: 'Microsoft 365 (Outlook & Teams)',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    statusText: 'Calendar synced, 2 upcoming meetings today',
    details: {
      accountName: 'enterprise@nueraresearch.com',
      pendingItemsCount: 2,
      syncIntervalMinutes: 15
    }
  },
  {
    platform: 'google',
    name: 'Google Workspace (Docs & Calendar)',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    statusText: 'Google Calendar events mapped into timeline',
    details: {
      accountName: 'lead@nueraresearch.com',
      pendingItemsCount: 1,
      syncIntervalMinutes: 15
    }
  },
  {
    platform: 'browser',
    name: 'Chrome / Microsoft Edge Bridge',
    connected: true,
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    statusText: 'Extension bridge active & listening for tab capture',
    details: {
      pendingItemsCount: 5,
      syncIntervalMinutes: 1
    }
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Microsoft 365: Executive Architecture Review',
    platform: 'm365',
    start: `${todayStr}T11:00:00`,
    end: `${todayStr}T12:00:00`,
    meetingUrl: 'https://teams.microsoft.com/l/meetup-join/sample',
    location: 'Microsoft Teams'
  },
  {
    id: 'cal-2',
    title: 'Google Workspace: Nuera Research Editorial Standup',
    platform: 'google',
    start: `${todayStr}T15:00:00`,
    end: `${todayStr}T15:30:00`,
    meetingUrl: 'https://meet.google.com/abc-def-ghi',
    location: 'Google Meet'
  },
  {
    id: 'cal-3',
    title: 'GitHub Release Sync & Deployment Cutoff',
    platform: 'github',
    start: `${todayStr}T17:00:00`,
    end: `${todayStr}T17:45:00`,
    location: 'Release Channel'
  }
];

export const initialTimeLogs: TimeLog[] = [
  {
    id: 'log-1',
    taskId: 'task-1',
    taskTitle: 'Finalize & Publish "Next-Gen Foundation Models" Whitepaper Draft',
    platform: 'wordpress',
    startTime: new Date(Date.now() - 3600 * 2000).toISOString(),
    endTime: new Date(Date.now() - 3600 * 1000).toISOString(),
    durationSeconds: 2700,
    notes: 'Reviewed benchmark diagrams and structured introduction.'
  },
  {
    id: 'log-2',
    taskId: 'task-3',
    taskTitle: 'Run Claude 3.7 Synthesis on Market Research Data & Competitor Moats',
    platform: 'claude',
    startTime: new Date(Date.now() - 3600 * 4000).toISOString(),
    endTime: new Date(Date.now() - 3600 * 3000).toISOString(),
    durationSeconds: 1200,
    notes: 'Generated deep prompt brief for Claude.'
  }
];
