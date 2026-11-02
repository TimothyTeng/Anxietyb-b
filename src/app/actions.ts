'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { checkins, db, plans, REMINDER_FREQS, subscribers, users } from '@/db';
import { checkPassword, createAccount, currentUser, emailSchema, progressFor, sendWelcome } from '@/lib/account';
import { planSchema, tidyPlan as tidy, type FormState } from '@/lib/forms';
import { getSession, randomToken, safeNext } from '@/lib/session';

export type { FormState };

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().max(200),
      consent: z.literal('on', { error: 'Tick the box to agree to receive emails.' }),
    })
    .safeParse({ email: form.get('email'), password: form.get('password') ?? '', consent: form.get('consent') });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
  const { email, password } = parsed.data;

  if (!password) {
    let [sub] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    const isNewSubscriber = !sub;
    if (!sub) {
      [sub] = await db.insert(subscribers).values({ email, unsubscribeToken: randomToken() }).returning();
    } else if (sub.status === 'unsubscribed') {
      [sub] = await db.update(subscribers).set({ status: 'subscribed', consentAt: new Date() }).where(eq(subscribers.id, sub.id)).returning();
    }
    if (isNewSubscriber) await sendWelcome(sub.id, email, sub.unsubscribeToken, false);
    return { status: 'list' };
  }

  const created = await createAccount(email, password);
  if ('error' in created) return { status: 'error', message: created.error };
  const session = await getSession();
  session.userId = created.userId;
  await session.save();
  return { status: 'account' };
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const found = await checkPassword(form.get('email'), form.get('password'));
  if ('error' in found) return { status: 'error', message: found.error };
  const session = await getSession();
  session.userId = found.id;
  await session.save();
  redirect(safeNext(form.get('next')));
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/');
}

async function requireUser() {
  const me = await currentUser();
  if (!me) redirect('/login');
  return me;
}

export async function addPlan(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = planSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
  await db.insert(plans).values({ userId: user.id, moment: parsed.data.moment, ifText: tidy(parsed.data.ifText), thenText: tidy(parsed.data.thenText) });
  revalidatePath('/plans');
  return { status: 'ok' };
}

export async function updatePlan(_prev: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = planSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
  await db
    .update(plans)
    .set({ moment: parsed.data.moment, ifText: tidy(parsed.data.ifText), thenText: tidy(parsed.data.thenText) })
    .where(and(eq(plans.id, Number(form.get('id'))), eq(plans.userId, user.id)));
  revalidatePath('/plans');
  return { status: 'ok' };
}

export async function togglePlan(form: FormData) {
  const { user } = await requireUser();
  await db
    .update(plans)
    .set({ active: form.get('active') === 'true' })
    .where(and(eq(plans.id, Number(form.get('id'))), eq(plans.userId, user.id)));
  revalidatePath('/plans');
}

export async function deletePlan(form: FormData) {
  const { user } = await requireUser();
  await db.delete(plans).where(and(eq(plans.id, Number(form.get('id'))), eq(plans.userId, user.id)));
  revalidatePath('/plans');
}

export type CheckinState = { newBadges: string[] };

export async function checkIn(_prev: CheckinState, form: FormData): Promise<CheckinState> {
  const { user } = await requireUser();
  const outcome = form.get('outcome') === 'ran' ? 'ran' : 'missed';
  const before = await progressFor(user.id);
  await db
    .insert(checkins)
    .values({ userId: user.id, weekStart: before.thisWeek, outcome })
    .onConflictDoUpdate({ target: [checkins.userId, checkins.weekStart], set: { outcome } });
  const after = await progressFor(user.id);
  const had = new Set(before.badges.filter((b) => b.earned).map((b) => b.title));
  revalidatePath('/plans');
  return { newBadges: after.badges.filter((b) => b.earned && !had.has(b.title)).map((b) => b.title) };
}

export async function setFrequency(form: FormData) {
  const { user } = await requireUser();
  const freq = z.enum(REMINDER_FREQS).safeParse(form.get('freq'));
  if (freq.success) await db.update(users).set({ reminderFreq: freq.data }).where(eq(users.id, user.id));
  revalidatePath('/plans');
}

export async function setNudges(form: FormData) {
  const { subscriber } = await requireUser();
  await db.update(subscribers).set({ nudges: form.get('nudges') === 'true' }).where(eq(subscribers.id, subscriber.id));
  revalidatePath('/plans');
}

export async function setUnsubscribed(form: FormData) {
  const token = String(form.get('token') ?? '');
  const status = form.get('status') === 'subscribed' ? 'subscribed' : 'unsubscribed';
  await db.update(subscribers).set({ status }).where(eq(subscribers.unsubscribeToken, token));
  redirect(`/unsubscribe?token=${encodeURIComponent(token)}&done=${status}`);
}
