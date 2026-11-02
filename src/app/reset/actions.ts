'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db, resets, routineDays } from '@/db';
import { currentUser } from '@/lib/account';
import { sgToday } from '@/lib/dates';
import { changeSchema, parseDay, parseReview, tidyChange as tidy, type FormState } from '@/lib/forms';
import { activeReset, resetFor } from '@/lib/reset';
import { logDayError, startDayOk, trialStartOptions } from '@/lib/routine';

async function requireUser() {
  const me = await currentUser();
  if (!me) redirect('/login?next=/reset/me');
  return me;
}

const done = () => {
  revalidatePath('/reset/me');
  revalidatePath('/plans');
};

export async function startReset(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const today = sgToday();
  const start = String(form.get('start') ?? today);
  if (!startDayOk(start, today)) return { status: 'error', message: 'Pick a start day in the last week.' };
  await db
    .update(resets)
    .set({ status: 'stopped' })
    .where(and(eq(resets.userId, user.id), inArray(resets.status, ['audit', 'trial'])));
  await db.insert(resets).values({ userId: user.id, auditStart: start });
  done();
  return { status: 'ok' };
}

export async function logDay(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = parseDay(form);
  if ('error' in parsed) return { status: 'error', message: parsed.error };
  const d = parsed.data;
  const reset = await activeReset(user.id);
  const problem = logDayError(reset, d.day, d.followed, sgToday());
  if (problem || !reset) return { status: 'error', message: problem ?? '' };
  const phase = reset.status === 'trial' ? 'trial' : 'audit';

  const values = { sleep: d.sleep, study: d.study, active: d.active, rest: d.rest, screen: d.screen, stress: d.stress, followed: phase === 'trial' ? d.followed : null, note: d.note };
  await db
    .insert(routineDays)
    .values({ resetId: reset.id, day: d.day, phase, ...values })
    .onConflictDoUpdate({ target: [routineDays.resetId, routineDays.day], set: { ...values, updatedAt: new Date() } });
  done();
  // The page moves on to the next open day; ?saved= lets it confirm the one just logged.
  redirect(`/reset/me?saved=${d.day}#log`);
}

export async function saveChange(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = changeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
  const r = await resetFor(user.id);
  if (!r.current || r.step !== 'plan') return { status: 'error', message: 'Finish your audit week first.' };
  const c = parsed.data;
  if (!trialStartOptions(r.current, r.today).includes(c.start)) return { status: 'error', message: 'Pick when your trial week starts.' };
  await db
    .update(resets)
    .set({
      status: 'trial',
      stressArea: c.stressArea,
      stressor: c.stressor || null,
      insteadOf: tidy(c.insteadOf),
      change: tidy(c.change),
      trialStart: c.start,
    })
    .where(eq(resets.id, r.current.id));
  done();
  return { status: 'ok' };
}

export async function saveReview(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = parseReview(form);
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
  const r = await resetFor(user.id);
  if (!r.current || r.step !== 'review') return { status: 'error', message: 'Your trial week isn’t finished yet.' };
  const v = parsed.data;
  await db
    .update(resets)
    .set({ status: 'done', obstacles: v.obstacles || null, helped: v.helped || null, wellbeingBefore: v.wellbeingBefore, wellbeingAfter: v.wellbeingAfter, decision: v.decision, completedAt: new Date() })
    .where(eq(resets.id, r.current.id));
  done();
  return { status: 'ok' };
}

export async function stopReset() {
  const { user } = await requireUser();
  await db
    .update(resets)
    .set({ status: 'stopped' })
    .where(and(eq(resets.userId, user.id), inArray(resets.status, ['audit', 'trial'])));
  done();
}

export async function setDailyEmails(form: FormData) {
  const { user } = await requireUser();
  const reset = await activeReset(user.id);
  if (reset) await db.update(resets).set({ dailyEmails: form.get('dailyEmails') === 'true' }).where(eq(resets.id, reset.id));
  done();
}
