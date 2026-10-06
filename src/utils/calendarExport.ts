import { Task, CalendarEvent } from '../types';

/**
 * Generates an iCalendar (.ics) string for tasks and scheduled blocks
 */
export function generateICSFeed(tasks: Task[], events: CalendarEvent[]): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const formatICSDate = (date: Date): string => {
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
      date.getUTCHours()
    )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OrbitFocus//Productivity Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:OrbitFocus Tasks & Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  const nowFormatted = formatICSDate(new Date());

  // Add scheduled tasks
  tasks.forEach((task) => {
    if (!task.dueDate && !task.scheduledDate) return;

    const startDate = task.scheduledDate
      ? new Date(`${task.scheduledDate}T${task.scheduledStartTime || '09:00'}:00`)
      : new Date(task.dueDate!);

    const endDate = new Date(startDate.getTime() + (task.estimatedMinutes || 60) * 60000);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:orbitfocus-${task.id}@orbitfocus.app`);
    lines.push(`DTSTAMP:${nowFormatted}`);
    lines.push(`DTSTART:${formatICSDate(startDate)}`);
    lines.push(`DTEND:${formatICSDate(endDate)}`);
    lines.push(`SUMMARY:[${task.priority.replace('_', ' ')}] ${task.title.replace(/[\n\r]/g, ' ')}`);
    lines.push(
      `DESCRIPTION:Priority: ${task.priority}\\nPlatform: ${task.platform}\\nEstimated: ${task.estimatedMinutes}m\\nScore: ${task.priorityScore}\\n\\n${(task.description || '').replace(/[\n\r]/g, '\\n')}`
    );
    if (task.externalRef?.url) {
      lines.push(`URL:${task.externalRef.url}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // Add calendar events
  events.forEach((ev) => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:event-${ev.id}@orbitfocus.app`);
    lines.push(`DTSTAMP:${nowFormatted}`);
    lines.push(`DTSTART:${formatICSDate(new Date(ev.start))}`);
    lines.push(`DTEND:${formatICSDate(new Date(ev.end))}`);
    lines.push(`SUMMARY:${ev.title.replace(/[\n\r]/g, ' ')}`);
    if (ev.location) lines.push(`LOCATION:${ev.location}`);
    if (ev.meetingUrl) lines.push(`URL:${ev.meetingUrl}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadICSFile(tasks: Task[], events: CalendarEvent[], filename = 'orbitfocus-schedule.ics') {
  const icsData = generateICSFeed(tasks, events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a direct Google Calendar creation link
 */
export function getGoogleCalendarUrl(task: Task): string {
  const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
  const endDate = new Date(startDate.getTime() + (task.estimatedMinutes || 60) * 60000);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[OrbitFocus] ${task.title}`,
    dates: `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`,
    details: `${task.description || ''}\n\nPlatform: ${task.platform}\nPriority: ${task.priority}\nOrbitFocus Link: ${window.location.origin}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a direct Microsoft 365 Outlook web calendar link
 */
export function getOutlookCalendarUrl(task: Task): string {
  const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
  const endDate = new Date(startDate.getTime() + (task.estimatedMinutes || 60) * 60000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `[OrbitFocus] ${task.title}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${task.description || ''}\n\nPlatform: ${task.platform}\nPriority: ${task.priority}`,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
