import type { Moment } from './constants';
import { SEMESTER_START } from './content';
import { addDays, shortDate, weekStartOf, weeksBetween } from './dates';

// A week counts once its check-in exists, whichever the outcome: noticing is the exercise.
export function currentStreak(weeks: Set<string>, thisWeek: string): number {
  let cursor = weeks.has(thisWeek) ? thisWeek : addDays(thisWeek, -7);
  let n = 0;
  while (weeks.has(cursor)) {
    n++;
    cursor = addDays(cursor, -7);
  }
  return n;
}

export function bestStreak(weeks: Set<string>): number {
  let best = 0;
  for (const w of weeks) {
    if (weeks.has(addDays(w, -7))) continue;
    let n = 0;
    let cursor = w;
    while (weeks.has(cursor)) {
      n++;
      cursor = addDays(cursor, 7);
    }
    best = Math.max(best, n);
  }
  return best;
}

export type WeekCell = { label: string; state: 'done' | 'current' | 'open' | 'missed' | 'later'; aria: string };

// Seven cells: four past weeks, this week, two upcoming.
export function weekRow(weeks: Set<string>, thisWeek: string): WeekCell[] {
  const semesterStart = weekStartOf(SEMESTER_START);
  return [-4, -3, -2, -1, 0, 1, 2].map((offset) => {
    const w = addDays(thisWeek, offset * 7);
    const n = weeksBetween(semesterStart, w) + 1;
    const label = n >= 1 && n <= 20 ? `W${n}` : shortDate(w);
    const name = n >= 1 && n <= 20 ? `Week ${n}` : `Week of ${shortDate(w)}`;
    if (weeks.has(w)) return { label, state: 'done', aria: `${name}: checked in` };
    if (offset === 0) return { label, state: 'current', aria: `${name}: this week, not checked in yet` };
    if (offset > 0) return { label, state: 'later', aria: `${name}: upcoming` };
    return { label, state: 'missed', aria: `${name}: no check-in` };
  });
}

export type Badge = { mark: string; title: string; desc: string; earned: boolean; status: string };

export function badges(opts: { planCount: number; moments: Moment[]; best: number }): Badge[] {
  const { planCount, best } = opts;
  const covered = (['Sleep', 'Avoidance', 'The body'] as Moment[]).filter((m) => opts.moments.includes(m)).length;
  const defs = [
    { mark: '1', title: 'First plan', desc: 'Wrote your first if/then plan.', earned: planCount >= 1, status: 'Write one plan' },
    { mark: '3', title: '3-week streak', desc: 'Checked in three weeks in a row.', earned: best >= 3, status: `${Math.min(best, 3)} of 3 weeks` },
    { mark: '4', title: '4-week streak', desc: 'A month of weekly plans.', earned: best >= 4, status: `${Math.min(best, 4)} of 4 weeks` },
    { mark: '3×', title: 'Three moments', desc: 'Plans for sleep, avoidance and the body.', earned: covered >= 3, status: `${covered} of 3 moments` },
    { mark: '13', title: 'Full semester', desc: 'Checked in every week of the semester.', earned: best >= 13, status: `${Math.min(best, 13)} of 13 weeks` },
    { mark: 'EX', title: 'Exam-season steady', desc: 'Checked in every week of the exam period.', earned: false, status: 'Opens in exam season' },
    { mark: 'W', title: 'On the wall', desc: 'Added your plan to a campus Plan Wall.', earned: false, status: 'Scan the code on any Plan Wall' },
  ];
  return defs.map((b) => ({ ...b, status: b.earned ? 'Earned' : b.status }));
}

/** Streak, week row and badges from plans and check-ins: an account's rows, or the ones saved on a device. */
export function progressFrom<P extends { moment: Moment }>(plans: P[], checkinRows: { weekStart: string; outcome: 'ran' | 'missed' }[], today: string) {
  const thisWeek = weekStartOf(today);
  const weeks = new Set(checkinRows.map((c) => c.weekStart));
  const best = bestStreak(weeks);
  return {
    plans,
    thisWeek,
    thisWeekOutcome: checkinRows.find((c) => c.weekStart === thisWeek)?.outcome ?? null,
    streak: currentStreak(weeks, thisWeek),
    best,
    row: weekRow(weeks, thisWeek),
    badges: badges({ planCount: plans.length, moments: plans.map((p) => p.moment), best }),
  };
}

// The smallest streak badge at or above `atLeast` (pass the current streak + 1), for the reminder email.
export function nextStreakBadge(atLeast: number): number | null {
  return [3, 4, 13].find((n) => n >= atLeast) ?? null;
}
