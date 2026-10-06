import { Task, EisenhowerQuadrant, Priority } from '../types';

/**
 * Calculates a dynamic priority score from 0 to 100 for a task.
 * Takes into account:
 * - Impact (1-5)
 * - Due date urgency (exponential ramp as deadline approaches)
 * - Effort / quick-win ratio
 * - Objective alignment
 * - Priority level override
 */
export function calculatePriorityScore(
  task: Pick<Task, 'impact' | 'effort' | 'dueDate' | 'priority' | 'objectiveId' | 'status'>
): number {
  if (task.status === 'completed') return 0;

  // 1. Impact component (0 - 35 points)
  const impactScore = (task.impact / 5) * 35;

  // 2. Deadline Urgency component (0 - 40 points)
  let urgencyScore = 15; // default moderate score if no due date
  if (task.dueDate) {
    const dueTime = new Date(task.dueDate).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      urgencyScore = 40; // Overdue! Maximum urgency
    } else if (diffHours <= 12) {
      urgencyScore = 38;
    } else if (diffHours <= 24) {
      urgencyScore = 34;
    } else if (diffHours <= 48) {
      urgencyScore = 28;
    } else if (diffHours <= 120) { // 5 days
      urgencyScore = 22;
    } else if (diffHours <= 240) { // 10 days
      urgencyScore = 14;
    } else {
      urgencyScore = 8;
    }
  }

  // 3. Effort / Quick Win factor (0 - 15 points)
  // Low effort tasks (effort = 1 or 2) get a slight speed bonus for momentum
  const effortScore = ((6 - task.effort) / 5) * 15;

  // 4. Strategic Alignment bonus (0 - 10 points)
  const strategicBonus = task.objectiveId ? 10 : 3;

  let total = impactScore + urgencyScore + effortScore + strategicBonus;

  // Adjust for manual priority level
  if (task.priority === 'P1_CRITICAL') total = Math.min(100, total + 15);
  else if (task.priority === 'P2_HIGH') total = Math.min(100, total + 8);
  else if (task.priority === 'P4_LOW') total = Math.max(5, total - 15);

  return Math.round(Math.min(100, Math.max(1, total)));
}

/**
 * Automatically infers Eisenhower Quadrant from Impact & Due Date proximity
 */
export function determineEisenhowerQuadrant(
  impact: number,
  dueDate?: string,
  priority?: Priority
): EisenhowerQuadrant {
  let isUrgent = false;

  if (priority === 'P1_CRITICAL') {
    isUrgent = true;
  } else if (dueDate) {
    const diffHours = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    // Urgent if due within 48 hours or overdue
    isUrgent = diffHours <= 48;
  }

  const isImportant = impact >= 3 || priority === 'P1_CRITICAL' || priority === 'P2_HIGH';

  if (isUrgent && isImportant) return 'DO_FIRST';
  if (!isUrgent && isImportant) return 'SCHEDULE';
  if (isUrgent && !isImportant) return 'DELEGATE';
  return 'ELIMINATE';
}

/**
 * Returns human-readable relative due date status
 */
export function getDueDateStatus(dueDate?: string): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean; // within 24h
  colorClass: string;
} {
  if (!dueDate) {
    return {
      label: 'No due date',
      isOverdue: false,
      isDueSoon: false,
      colorClass: 'text-slate-400'
    };
  }

  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diffMs = due - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) {
      return {
        label: `Overdue by ${overdueHours}h`,
        isOverdue: true,
        isDueSoon: false,
        colorClass: 'text-rose-400 font-semibold'
      };
    }
    return {
      label: `Overdue by ${Math.abs(diffDays)}d`,
      isOverdue: true,
      isDueSoon: false,
      colorClass: 'text-rose-400 font-semibold'
    };
  }

  if (diffHours <= 1) {
    return {
      label: 'Due in < 1h',
      isOverdue: false,
      isDueSoon: true,
      colorClass: 'text-amber-400 font-semibold animate-pulse'
    };
  }

  if (diffHours < 24) {
    return {
      label: `Due in ${diffHours}h`,
      isOverdue: false,
      isDueSoon: true,
      colorClass: 'text-amber-400 font-medium'
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isDueSoon: true,
      colorClass: 'text-yellow-400'
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      isDueSoon: false,
      colorClass: 'text-blue-400'
    };
  }

  return {
    label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isDueSoon: false,
    colorClass: 'text-slate-300'
  };
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

export function formatMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}
