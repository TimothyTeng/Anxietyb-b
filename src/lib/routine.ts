import type { Reset, RoutineDay } from '@/db/schema';
import { ROUTINE_KEYS, type Followed, type RoutineKey } from './constants';
import { ACTIVE_GUIDE_MIN, ROUTINE_FIELDS, SLEEP_GUIDE } from './content';
import { addDays, dayOfWeek } from './dates';

// Pure Reset-your-routine logic (no database), shared by the pages, the actions and the daily email job.

export type ResetStep = 'start' | 'audit' | 'plan' | 'trial' | 'review' | 'done';
type ResetLike = Pick<Reset, 'status' | 'auditStart' | 'trialStart' | 'dailyEmails'>;
type DayLike = Pick<RoutineDay, 'day' | RoutineKey | 'stress' | 'followed' | 'note'>;

// The audit needs a few days to say anything; the trial is worth reviewing however it went.
const AUDIT_MIN_DAYS = 3;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const weekdayOf = (day: string) => WEEKDAYS[dayOfWeek(day)];
export const dayLabel = (day: string) => `${weekdayOf(day)} ${Number(day.slice(8))} ${MONTHS[Number(day.slice(5, 7)) - 1]}`;
export const hours = (n: number) => String(Math.round(n * 10) / 10);

export const weekFrom = (start: string) => [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(start, n));
export const auditDays = (r: Pick<ResetLike, 'auditStart'>) => weekFrom(r.auditStart);
export const trialDays = (r: Pick<ResetLike, 'trialStart'>) => (r.trialStart ? weekFrom(r.trialStart) : []);
export const auditEnd = (r: Pick<ResetLike, 'auditStart'>) => addDays(r.auditStart, 6);
export const trialEnd = (r: Pick<ResetLike, 'trialStart'>) => (r.trialStart ? addDays(r.trialStart, 6) : null);

const countIn = (window: string[], logged: Set<string>) => window.filter((d) => logged.has(d)).length;

export function auditComplete(r: ResetLike, logged: Set<string>, today: string): boolean {
  const n = countIn(auditDays(r), logged);
  return n === 7 || (today > auditEnd(r) && n >= AUDIT_MIN_DAYS);
}

export function trialComplete(r: ResetLike, logged: Set<string>, today: string): boolean {
  const end = trialEnd(r);
  return end !== null && (countIn(trialDays(r), logged) === 7 || today > end);
}

/** An audit starts today, or up to 6 days back for students who have already been keeping track. */
export const startDayOk = (start: string, today: string) => /^\d{4}-\d{2}-\d{2}$/.test(start) && start <= today && start >= addDays(today, -6);

/** Why a day can't be logged against this reset, or null when it can. */
export function logDayError(r: ResetLike | null, day: string, followed: Followed | undefined, today: string): string | null {
  if (!r || !editableDays(r, today).includes(day)) return 'That day can’t be logged any more.';
  if (r.status === 'trial' && !followed) return 'Say whether you followed your new routine.';
  return null;
}

/** The two days a trial week can start on: the first day after the audit week (or today, if later), and the day after. */
export function trialStartOptions(r: Pick<ResetLike, 'auditStart'>, today: string): [string, string] {
  const first = today > auditEnd(r) ? today : addDays(auditEnd(r), 1);
  return [first, addDays(first, 1)];
}

/** The audit week ended without enough days to plan from: the student needs to start again. */
export function auditExpired(r: ResetLike, logged: Set<string>, today: string): boolean {
  return r.status === 'audit' && today > auditEnd(r) && countIn(auditDays(r), logged) < AUDIT_MIN_DAYS;
}

export function stepFor(r: ResetLike | null, logged: Set<string>, today: string): ResetStep {
  if (!r || r.status === 'stopped') return 'start';
  if (r.status === 'done') return 'done';
  if (r.status === 'audit') return auditComplete(r, logged, today) ? 'plan' : 'audit';
  return trialComplete(r, logged, today) ? 'review' : 'trial';
}

/** Days that can be logged or edited now: the active week's days up to today. */
export function editableDays(r: ResetLike | null, today: string): string[] {
  if (!r) return [];
  const window = r.status === 'audit' ? auditDays(r) : r.status === 'trial' ? trialDays(r) : [];
  return window.filter((d) => d <= today);
}

// ── Calendar ─────────────────────────────────────────────────────────

export type CalendarCell = {
  day: string;
  label: string;
  weekday: string;
  date: number;
  logged: boolean;
  segments: { key: RoutineKey | 'other'; h: number }[];
  stress: number | null;
  followed: Followed | null;
  isToday: boolean;
  future: boolean;
  editable: boolean;
  selected: boolean;
  tentative: boolean;
  aria: string;
};
export type CalendarRow = { phase: 'audit' | 'trial'; title: string; sub: string; cells: CalendarCell[] };

const FOLLOW_TEXT: Record<Followed, string> = { yes: 'Followed', partly: 'Partly', no: 'Not today' };
export const followText = (f: Followed | null) => (f ? FOLLOW_TEXT[f] : '');

function segmentsOf(d: DayLike) {
  const used = ROUTINE_KEYS.reduce((t, k) => t + d[k], 0);
  return [...ROUTINE_KEYS.map((key) => ({ key, h: d[key] })), { key: 'other' as const, h: Math.max(0, 24 - used) }];
}

export function calendarRows(r: ResetLike, byDay: Map<string, DayLike>, today: string, selected: string | null): CalendarRow[] {
  const editable = new Set(editableDays(r, today));
  const cell = (day: string, tentative: boolean): CalendarCell => {
    const d = tentative ? undefined : byDay.get(day);
    const future = day > today;
    const parts = d ? ROUTINE_FIELDS.map((f) => `${hours(d[f.key])} h ${f.label.toLowerCase()}`).join(', ') : '';
    return {
      day,
      label: dayLabel(day),
      weekday: weekdayOf(day),
      date: Number(day.slice(8)),
      logged: Boolean(d),
      segments: d ? segmentsOf(d) : [],
      stress: d?.stress ?? null,
      followed: d?.followed ?? null,
      isToday: day === today && !tentative,
      future,
      editable: editable.has(day),
      selected: day === selected,
      tentative,
      aria: d
        ? `${dayLabel(day)}: ${parts}. Stress ${d.stress} of 5.${d.followed ? ` ${followText(d.followed)}.` : ''}`
        : `${dayLabel(day)}: ${tentative ? 'trial week, not started' : future ? 'upcoming' : 'not logged yet'}`,
    };
  };
  const audit = auditDays(r);
  const trial = trialDays(r);
  const loggedAudit = countIn(audit, new Set(byDay.keys()));
  const loggedTrial = countIn(trial, new Set(byDay.keys()));
  return [
    {
      phase: 'audit',
      title: 'Audit week',
      sub: r.status === 'audit' ? `${loggedAudit} of 7 logged` : `${dayLabel(audit[0])} – ${dayLabel(audit[6])}`,
      cells: audit.map((d) => cell(d, false)),
    },
    trial.length
      ? { phase: 'trial', title: 'Trial week', sub: `${loggedTrial} of 7 logged`, cells: trial.map((d) => cell(d, false)) }
      : { phase: 'trial', title: 'Trial week', sub: 'Starts after you choose your change', cells: weekFrom(addDays(auditEnd(r), 1)).map((d) => cell(d, true)) },
  ];
}

// ── Summaries ────────────────────────────────────────────────────────

type Averages = Record<RoutineKey | 'stress', number>;

export function averages(rows: DayLike[]): Averages {
  const avg = (k: RoutineKey | 'stress') => (rows.length ? rows.reduce((t, r) => t + r[k], 0) / rows.length : 0);
  return { sleep: avg('sleep'), study: avg('study'), active: avg('active'), rest: avg('rest'), screen: avg('screen'), stress: avg('stress') };
}

export type AuditSummary = {
  days: number;
  avg: Averages;
  activeMinutes: number;
  sleepLow: boolean;
  activeLow: boolean;
  studyRange: [number, number];
  /** Stressful days (4+) against the rest, when there are both. */
  contrast: { days: string[]; sleepLess: number; studyMore: number } | null;
};

export function summarizeAudit(rows: DayLike[]): AuditSummary {
  const avg = averages(rows);
  // Scale a partly logged week up to seven days before comparing with the weekly guide.
  const activeMinutes = rows.length ? Math.round((rows.reduce((t, r) => t + r.active, 0) * 60 * 7) / rows.length) : 0;
  const hi = rows.filter((r) => r.stress >= 4);
  const lo = rows.filter((r) => r.stress < 4);
  const a = averages(hi);
  const b = averages(lo);
  const study = rows.map((r) => r.study);
  return {
    days: rows.length,
    avg,
    activeMinutes,
    sleepLow: avg.sleep < SLEEP_GUIDE.min,
    activeLow: activeMinutes < ACTIVE_GUIDE_MIN,
    studyRange: [Math.min(...study), Math.max(...study)],
    contrast: hi.length && lo.length ? { days: hi.map((r) => weekdayOf(r.day)), sleepLess: b.sleep - a.sleep, studyMore: a.study - b.study } : null,
  };
}

export function contrastSentence(s: AuditSummary): string | null {
  const c = s.contrast;
  if (!c) return null;
  const n = c.days.length;
  return `On your ${n} most stressful ${n === 1 ? 'day' : 'days'} (${c.days.join(', ')}), you slept ${hours(Math.abs(c.sleepLess))} h ${c.sleepLess >= 0 ? 'less' : 'more'} and spent ${hours(Math.abs(c.studyMore))} h ${c.studyMore >= 0 ? 'more' : 'less'} on study and work than on your other days.`;
}

export type WeekComparison = {
  rows: { label: string; audit: string; trial: string }[];
  stressAudit: string;
  stressTrial: string;
  followed: number;
  partly: number;
  trialDays: number;
};

export function compareWeeks(audit: DayLike[], trial: DayLike[]): WeekComparison {
  const a = averages(audit);
  const t = averages(trial);
  return {
    rows: [
      ...ROUTINE_FIELDS.map((f) => ({ label: f.label, audit: `${hours(a[f.key])} h`, trial: `${hours(t[f.key])} h` })),
      { label: 'Stress (1–5)', audit: hours(a.stress), trial: hours(t.stress) },
    ],
    stressAudit: hours(a.stress),
    stressTrial: hours(t.stress),
    followed: trial.filter((d) => d.followed === 'yes').length,
    partly: trial.filter((d) => d.followed === 'partly').length,
    trialDays: trial.length,
  };
}

// ── Badges ───────────────────────────────────────────────────────────

export type ResetBadge = { mark: string; title: string; desc: string; earned: boolean; status: string };

export function resetBadges(all: { reset: ResetLike; days: Set<string> }[]): ResetBadge[] {
  const bestAudit = Math.max(0, ...all.map((x) => countIn(auditDays(x.reset), x.days)));
  const bestTrial = Math.max(0, ...all.map((x) => countIn(trialDays(x.reset), x.days)));
  const changed = all.some((x) => x.reset.trialStart);
  const done = all.filter((x) => x.reset.status === 'done').length;
  const defs = [
    { mark: '7', title: 'Audit week', desc: 'Logged all 7 days of an audit.', earned: bestAudit >= 7, status: `${bestAudit} of 7 days` },
    { mark: '1', title: 'One change', desc: 'Chose a realistic change to try.', earned: changed, status: 'Pick your change' },
    { mark: 'T', title: 'Trial week', desc: 'Logged at least 5 days of a trial week.', earned: bestTrial >= 5, status: `${Math.min(bestTrial, 5)} of 5 days` },
    { mark: 'R', title: 'Reviewed', desc: 'Looked back and decided what’s next.', earned: done >= 1, status: 'Finish your review' },
    { mark: '2×', title: 'Reset again', desc: 'Completed a second reset.', earned: done >= 2, status: `${Math.min(done, 2)} of 2 resets` },
  ];
  return defs.map((b) => ({ ...b, status: b.earned ? 'Earned' : b.status }));
}

// ── One student's resets, ready for the page ─────────────────────────

/** The fields the reset pages show, shared by account rows and resets saved on a device. */
export type ResetView = ResetLike &
  Pick<Reset, 'id' | 'stressArea' | 'stressor' | 'insteadOf' | 'change' | 'decision' | 'obstacles' | 'helped' | 'wellbeingBefore' | 'wellbeingAfter'>;
export type DayView = DayLike & Pick<RoutineDay, 'resetId' | 'phase'>;

/** `all` is newest first. */
export function computeReset<R extends ResetView, D extends DayView>(all: R[], days: D[], today: string) {
  const daysOf = (r: R) => days.filter((d) => d.resetId === r.id);
  // The reset in progress; otherwise the latest finished one, until a new one starts.
  const current = all.find((r) => r.status === 'audit' || r.status === 'trial') ?? (all[0]?.status === 'done' ? all[0] : null);
  const byDay = new Map((current ? daysOf(current) : []).map((d) => [d.day, d]));
  const logged = new Set(byDay.keys());
  return {
    current,
    byDay,
    step: stepFor(current, logged, today),
    editable: editableDays(current, today),
    auditRows: current ? auditDays(current).flatMap((d) => byDay.get(d) ?? []) : [],
    trialRows: current ? trialDays(current).flatMap((d) => byDay.get(d) ?? []) : [],
    history: all.filter((r) => r.status === 'done'),
    badges: resetBadges(all.map((r) => ({ reset: r, days: new Set(daysOf(r).map((d) => d.day)) }))),
    today,
  };
}
export type ResetData = ReturnType<typeof computeReset<ResetView, DayView>>;

// ── Emails ───────────────────────────────────────────────────────────

export type RoutinePrompt = { kind: 'review' | 'plan' | 'trial' | 'log'; day?: string };

/** The one routine email due today, if any: review, then plan, then trial start, then "log yesterday". */
export function routinePromptFor(r: ResetLike, logged: Set<string>, today: string): RoutinePrompt | null {
  if (r.status === 'trial') {
    const end = trialEnd(r)!;
    if (today === addDays(end, 1)) return { kind: 'review' };
    if (today === r.trialStart) return { kind: 'trial' };
  }
  if (r.status === 'audit' && today === addDays(auditEnd(r), 1) && countIn(auditDays(r), logged) >= AUDIT_MIN_DAYS) return { kind: 'plan' };
  const yesterday = addDays(today, -1);
  if (r.dailyEmails && editableDays(r, today).includes(yesterday) && !logged.has(yesterday)) return { kind: 'log', day: yesterday };
  return null;
}
