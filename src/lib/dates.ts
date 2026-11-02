// All campaign dates are Singapore calendar dates (UTC+8, no daylight saving), as 'YYYY-MM-DD'.
const SG_OFFSET_MS = 8 * 60 * 60 * 1000;

export function sgToday(now: Date = new Date()): string {
  return new Date(now.getTime() + SG_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 0 = Sunday … 6 = Saturday
export function dayOfWeek(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

export function weekStartOf(day: string): string {
  return addDays(day, -((dayOfWeek(day) + 6) % 7));
}

export function weeksBetween(fromMonday: string, toMonday: string): number {
  const ms = new Date(`${toMonday}T00:00:00Z`).getTime() - new Date(`${fromMonday}T00:00:00Z`).getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

export function shortDate(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
