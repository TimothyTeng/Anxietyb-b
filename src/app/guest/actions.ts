'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { checkins, db, plans, resets, routineDays } from '@/db';
import { checkPassword, createAccount, currentUser, emailSchema } from '@/lib/account';
import { guestPayloadSchema, tidyChange, tidyPlan, type FormState, type GuestPayload } from '@/lib/forms';
import { getSession } from '@/lib/session';

/**
 * Moves what a student saved on their device into an account: a new one (mode "create"), one they sign in to
 * ("signin"), or the one they're already signed in to ("import").
 * If both the device and the account have a reset in progress, it signs them in and asks which to keep ("conflict");
 * the browser then sends the choice back with mode "import".
 */
export async function saveGuest(_prev: FormState, form: FormData): Promise<FormState> {
  let payload: GuestPayload;
  try {
    const parsed = guestPayloadSchema.safeParse(JSON.parse(String(form.get('payload') ?? '')));
    if (!parsed.success) return { status: 'error', message: 'Something on this device couldn’t be read. Try again, or write it in again after signing in.' };
    payload = parsed.data;
  } catch {
    return { status: 'error', message: 'Something on this device couldn’t be read.' };
  }

  const mode = form.get('mode');
  let userId: number;
  if (mode === 'create') {
    const parsed = z
      .object({ email: emailSchema, password: z.string().max(200), consent: z.literal('on', { error: 'Tick the box to agree to receive emails.' }) })
      .safeParse({ email: form.get('email'), password: form.get('password') ?? '', consent: form.get('consent') });
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
    const created = await createAccount(parsed.data.email, parsed.data.password);
    if ('error' in created) return { status: 'error', message: created.error };
    userId = created.userId;
  } else if (mode === 'signin') {
    const found = await checkPassword(form.get('email'), form.get('password'));
    if ('error' in found) return { status: 'error', message: found.error };
    userId = found.id;
  } else {
    const me = await currentUser();
    if (!me) return { status: 'error', message: 'Sign in first.' };
    userId = me.user.id;
  }

  const session = await getSession();
  session.userId = userId;
  await session.save();

  const choice = form.get('resetChoice');
  const deviceActive = payload.resets.find((r) => r.status === 'audit' || r.status === 'trial');
  const [accountActive] = await db
    .select({ id: resets.id })
    .from(resets)
    .where(and(eq(resets.userId, userId), inArray(resets.status, ['audit', 'trial'])))
    .limit(1);
  if (deviceActive && accountActive && choice !== 'device' && choice !== 'account') return { status: 'conflict' };

  await importGuest(userId, payload, accountActive && deviceActive ? (choice as 'device' | 'account') : null);
  revalidatePath('/plans');
  revalidatePath('/reset/me');
  return { status: 'ok' };
}

async function importGuest(userId: number, p: GuestPayload, keep: 'device' | 'account' | null) {
  if (p.plans.length) {
    await db.insert(plans).values(p.plans.map((x) => ({ userId, moment: x.moment, ifText: tidyPlan(x.ifText), thenText: tidyPlan(x.thenText), active: x.active })));
  }
  if (p.checkins.length) {
    await db
      .insert(checkins)
      .values(p.checkins.map((c) => ({ userId, weekStart: c.weekStart, outcome: c.outcome })))
      .onConflictDoNothing();
  }
  if (keep === 'device') {
    await db
      .update(resets)
      .set({ status: 'stopped' })
      .where(and(eq(resets.userId, userId), inArray(resets.status, ['audit', 'trial'])));
  }
  // Oldest first, so the account's newest reset is the device's newest.
  for (const r of [...p.resets].reverse()) {
    const active = r.status === 'audit' || r.status === 'trial';
    if (active && keep === 'account') continue;
    const [row] = await db
      .insert(resets)
      .values({
        userId,
        status: r.status,
        auditStart: r.auditStart,
        stressArea: r.stressArea,
        stressor: r.stressor,
        insteadOf: r.insteadOf ? tidyChange(r.insteadOf) : null,
        change: r.change ? tidyChange(r.change) : null,
        trialStart: r.trialStart,
        obstacles: r.obstacles,
        helped: r.helped,
        wellbeingBefore: r.wellbeingBefore,
        wellbeingAfter: r.wellbeingAfter,
        decision: r.decision,
        completedAt: r.status === 'done' ? new Date() : null,
      })
      .returning({ id: resets.id });
    const days = p.days.filter((d) => d.resetId === r.id);
    if (days.length) {
      await db
        .insert(routineDays)
        .values(days.map(({ resetId: _, ...d }) => ({ ...d, resetId: row.id })))
        .onConflictDoNothing();
    }
  }
}
