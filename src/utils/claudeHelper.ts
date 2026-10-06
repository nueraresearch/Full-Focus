import { Task } from '../types';

/**
 * Builds a prompt template ready to copy or send to Claude (claude.ai)
 */
export function generateClaudePromptBrief(task: Task, contextType: 'deep_work' | 'nuera_editorial' | 'code_review' | 'executive_summary'): string {
  let instructions = '';

  switch (contextType) {
    case 'nuera_editorial':
      instructions = `Role: Senior Research Editor & Technical Analyst at Nuera Research (nueraresearch.com).
Tone: Authoritative, rigorously analytical, data-driven, and forward-looking.
Audience: Industry executives, researchers, and technical decision-makers.
Goal: Produce a comprehensive, citation-backed draft ready for WordPress publication. Include:
- Executive Thesis
- Key Market/Technical Findings
- Deep Dive Analysis with Concrete Case Studies
- Actionable Takeaways & Next Milestones
- SEO Metadata (Title tag, Meta description, 5 recommended tags)`;
      break;

    case 'code_review':
      instructions = `Role: Principal Software Architect & Security Auditor.
Objective: Analyze architecture, potential edge cases, performance bottlenecks, and test coverage.
Deliverable: Step-by-step implementation guide with clean TypeScript/React code snippets and verification tests.`;
      break;

    case 'executive_summary':
      instructions = `Role: Chief of Staff / Technical Program Manager.
Objective: Synthesize this deliverable into a crisp executive briefing for stakeholders.
Format:
1. Status & Core Objective
2. Critical Blockers & Dependencies
3. Key Metrics & Progress Percentage
4. Next 48-Hour Execution Horizon`;
      break;

    case 'deep_work':
    default:
      instructions = `Role: High-Output Technical Partner & Strategic Co-Pilot.
Objective: Solve this objective end-to-end with zero fluff and highest craftsmanship.
Approach: Think step-by-step, outline architectural trade-offs, and generate fully realized production assets.`;
      break;
  }

  return `### SYSTEM CONTEXT & ROLE
${instructions}

### TASK OBJECTIVE
Title: ${task.title}
Platform: ${task.platform.toUpperCase()}
Priority: ${task.priority} (Eisenhower Quadrant: ${task.quadrant})
Target Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'High Priority Sprint'}

### DESCRIPTION & DETAILS
${task.description || 'Deliver optimal execution on this priority.'}

${task.subtasks.length > 0 ? `### CURRENT SUBTASKS & CHECKLIST:\n${task.subtasks.map(s => `- [${s.completed ? 'x' : ' '}] ${s.title}`).join('\n')}` : ''}

${task.externalRef?.url ? `### REFERENCE URL:\n${task.externalRef.url}` : ''}

### REQUEST
Please execute on the above task objective. Provide complete, unambiguous output ready for immediate integration into our workflow.`;
}

/**
 * Parses Claude or AI generated response text into actionable tasks
 */
export function parseAIResponseIntoTasks(rawText: string, defaultPlatform: 'claude' | 'general' = 'claude'): Partial<Task>[] {
  const lines = rawText.split('\n');
  const tasks: Partial<Task>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Look for bullet points or numbered lists or markdown checkboxes
    const match = trimmed.match(/^([-*•]|\d+\.|\-\s*\[[ xX]\])\s+(.+)$/);
    if (match && match[2] && match[2].length > 4) {
      const itemText = match[2].trim();
      // Exclude short conversational text
      if (!itemText.toLowerCase().startsWith('here is') && !itemText.toLowerCase().startsWith('sure,')) {
        tasks.push({
          title: itemText.replace(/^\*\*|\*\*$/g, ''),
          platform: defaultPlatform,
          status: 'todo',
          priority: 'P2_HIGH',
          quadrant: 'SCHEDULE',
          impact: 4,
          effort: 3,
          estimatedMinutes: 45,
          tags: ['claude-extracted']
        });
      }
    }
  }

  return tasks;
}
