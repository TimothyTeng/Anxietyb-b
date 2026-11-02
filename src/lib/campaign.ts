import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import { createElement } from 'react';
import { db, resets, routineDays, subscribers, users, type Broadcast, type ReminderFreq } from '@/db';
import BroadcastEmail from '@/emails/Broadcast';
import CalmNudge from '@/emails/CalmNudge';
import RoutinePrompt from '@/emails/RoutinePrompt';
import WeeklyReminder from '@/emails/WeeklyReminder';
import { progressFor } from './account';
import { EXAM_PERIODS, NUDGES, posterByKey, RESET_NOTES } from './content';
import { auditDays, compareWeeks, contrastSentence, dayLabel, routinePromptFor, summarizeAudit, trialDays } from './routine';
import { dayOfWeek, weekStartOf, weeksBetween } from './dates';
import { sendOnce, unsubscribeUrl, type Outgoing } from './email';
import { nextStreakBadge } from './progress';
import { appUrl, sign } from './session';

const EPOCH_MONDAY = '2026-01-05';

export function nudgeFor(today: string): string {
  return NUDGES[weeksBetween(EPOCH_MONDAY, weekStartOf(today)) % NUDGES.length];
}

export function isReminderDay(freq: ReminderFreq, today: string): boolean {
  const dow = dayOfWeek(today);
  if (freq === 'weekly') return dow === 0;
  if (freq === 'twice') return dow === 0 || dow === 3;
  if (freq === 'daily') return true;
  return EXAM_PERIODS.some((p) => today >= p.start && today <= p.end);
}

export function checkinUrl(userId: number, outcome: 'ran' | 'missed'): string {
  return appUrl(`/checkin?u=${userId}&o=${outcome}&s=${sign(`checkin.${userId}`)}`);
}

export async function reminderFor(userId: number, today: string, subscriber: { id: number; email: string; unsubscribeToken: string }): Promise<Outgoing | null> {
  const progress = await progressFor(userId, today);
  const active = progress.plans.filter((p) => p.active);
  if (!active.length) return null;
  // Rotate through active plans: weekly for weekly/twice-a-week, daily otherwise.
  const plan = active[weeksBetween(EPOCH_MONDAY, weekStartOf(today)) % active.length];
  return {
    subscriberId: subscriber.id,
    to: subscriber.email,
    subject: `IF ${plan.ifText}…`,
    react: createElement(WeeklyReminder, {
      firstName: null,
      ifText: plan.ifText,
      thenText: plan.thenText,
      streak: progress.streak,
      nextBadge: nextStreakBadge(progress.streak + 1),
      nudge: nudgeFor(today),
      ranUrl: checkinUrl(userId, 'ran'),
      missedUrl: checkinUrl(userId, 'missed'),
      plansUrl: appUrl('/plans'),
      unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribeToken),
    }),
    unsubscribeToken: subscriber.unsubscribeToken,
    kind: 'reminder',
    refId: 'daily',
  };
}

/** The once-a-day job: plan reminders for accounts due today, plus Monday's calm nudge to the whole list. */
export async function runDaily(today: string) {
  const accounts = await db
    .select({ userId: users.id, freq: users.reminderFreq, subscriberId: subscribers.id, email: subscribers.email, token: subscribers.unsubscribeToken })
    .from(users)
    .innerJoin(subscribers, eq(users.subscriberId, subscribers.id))
    .where(eq(subscribers.status, 'subscribed'));

  const due = accounts.filter((a) => isReminderDay(a.freq, today));
  const reminders = (
    await Promise.all(due.map((a) => reminderFor(a.userId, today, { id: a.subscriberId, email: a.email, unsubscribeToken: a.token })))
  ).filter((m): m is Outgoing => m !== null);
  const remindersSent = await sendOnce(reminders, today);

  let nudgesSent = 0;
  if (dayOfWeek(today) === 1) {
    const list = await db.select().from(subscribers).where(and(eq(subscribers.status, 'subscribed'), eq(subscribers.nudges, true)));
    const nudge = nudgeFor(today);
    nudgesSent = await sendOnce(
      list.map((s) => ({
        subscriberId: s.id,
        to: s.email,
        subject: 'Your calm nudge for this week',
        react: createElement(CalmNudge, { nudge, howUrl: appUrl('/how-it-works'), plansUrl: appUrl('/plans'), unsubscribeUrl: unsubscribeUrl(s.unsubscribeToken) }),
        unsubscribeToken: s.unsubscribeToken,
        kind: 'nudge' as const,
        refId: 'weekly',
      })),
      today,
    );
  }

  const routinePromptsSent = await sendOnce(await routinePrompts(today), today);

  return { today, accountsDue: due.length, remindersSent, nudgesSent, routinePromptsSent };
}

const PROMPT_SUBJECT = { plan: 'Your audit week is done', trial: 'Your trial week starts today', review: 'Time to review your reset' } as const;

/** Reset your routine: at most one email per person a day, for subscribed accounts with a reset in progress. */
export async function routinePrompts(today: string): Promise<Outgoing[]> {
  const active = await db
    .select({ reset: resets, subscriberId: subscribers.id, email: subscribers.email, token: subscribers.unsubscribeToken })
    .from(resets)
    .innerJoin(users, eq(resets.userId, users.id))
    .innerJoin(subscribers, eq(users.subscriberId, subscribers.id))
    .where(and(inArray(resets.status, ['audit', 'trial']), eq(subscribers.status, 'subscribed')));
  if (!active.length) return [];
  const days = await db.select().from(routineDays).where(inArray(routineDays.resetId, active.map((a) => a.reset.id)));

  return active.flatMap(({ reset, subscriberId, email, token }) => {
    const mine = days.filter((d) => d.resetId === reset.id);
    const byDay = new Map(mine.map((d) => [d.day, d]));
    const prompt = routinePromptFor(reset, new Set(byDay.keys()), today);
    if (!prompt) return [];
    const auditRows = auditDays(reset).flatMap((d) => byDay.get(d) ?? []);
    const trialRows = trialDays(reset).flatMap((d) => byDay.get(d) ?? []);
    const window = reset.status === 'trial' ? trialDays(reset) : auditDays(reset);
    const cmp = prompt.kind === 'review' ? compareWeeks(auditRows, trialRows) : null;
    const tag = {
      log: `${reset.status === 'trial' ? 'TRIAL' : 'AUDIT'} · DAY ${window.indexOf(prompt.day ?? '') + 1} OF 7`,
      plan: 'AUDIT COMPLETE',
      trial: 'TRIAL · DAY 1 OF 7',
      review: 'TRIAL COMPLETE',
    }[prompt.kind];
    const label = prompt.day ? dayLabel(prompt.day) : null;
    return [
      {
        subscriberId,
        to: email,
        subject: prompt.kind === 'log' ? `Log ${label} in about a minute` : PROMPT_SUBJECT[prompt.kind],
        react: createElement(RoutinePrompt, {
          kind: prompt.kind,
          tag,
          dayLabel: label,
          insight: prompt.kind === 'plan' ? contrastSentence(summarizeAudit(auditRows)) : null,
          insteadOf: reset.insteadOf,
          change: reset.change,
          followed: cmp ? `${cmp.followed}/${cmp.trialDays}` : null,
          stress: cmp ? `${cmp.stressAudit} → ${cmp.stressTrial}` : null,
          note: RESET_NOTES[prompt.kind],
          actionUrl: appUrl(prompt.day ? `/reset/me?day=${prompt.day}#log` : '/reset/me'),
          manageUrl: appUrl('/reset/me'),
          unsubscribeUrl: unsubscribeUrl(token),
        }),
        unsubscribeToken: token,
        kind: 'routine' as const,
        refId: prompt.kind,
      },
    ];
  });
}

export function broadcastEmail(b: Pick<Broadcast, 'subject' | 'body' | 'posterKey'>, unsubscribeToken: string) {
  return createElement(BroadcastEmail, {
    subject: b.subject,
    body: b.body,
    poster: posterByKey(b.posterKey) ?? null,
    howUrl: appUrl('/how-it-works'),
    plansUrl: appUrl('/plans'),
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
  });
}

export async function sendBroadcast(b: Broadcast, today: string): Promise<number> {
  const list = await db.select().from(subscribers).where(eq(subscribers.status, 'subscribed'));
  return sendOnce(
    list.map((s) => ({
      subscriberId: s.id,
      to: s.email,
      subject: b.subject,
      react: broadcastEmail(b, s.unsubscribeToken),
      unsubscribeToken: s.unsubscribeToken,
      kind: 'broadcast' as const,
      refId: `b${b.id}`,
    })),
    today,
  );
}
