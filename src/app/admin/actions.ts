'use server';

import { timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { broadcasts, db, POSTER_KEYS } from '@/db';
import { broadcastEmail, runDaily, sendBroadcast } from '@/lib/campaign';
import { sgToday } from '@/lib/dates';
import { sendTest } from '@/lib/email';
import { getSession } from '@/lib/session';

export type AdminState = { status: 'idle' | 'ok' | 'error'; message?: string };

export async function adminLogin(_prev: AdminState, form: FormData): Promise<AdminState> {
  const given = Buffer.from(String(form.get('password') ?? ''));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? '');
  if (!expected.length || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { status: 'error', message: 'Wrong password.' };
  }
  const session = await getSession();
  session.admin = true;
  await session.save();
  redirect('/admin');
}

export async function adminLogout() {
  const session = await getSession();
  session.admin = false;
  await session.save();
  redirect('/admin');
}

async function requireAdmin() {
  if (!(await getSession()).admin) redirect('/admin');
}

const broadcastSchema = z.object({
  subject: z.string().trim().min(1, 'Add a subject.').max(140),
  body: z.string().trim().min(1, 'Write a message.').max(5000),
  posterKey: z.enum(POSTER_KEYS).or(z.literal('')).transform((v) => v || null),
});

export async function sendBroadcastAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = broadcastSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };

  if (form.get('mode') === 'test') {
    const to = process.env.ADMIN_EMAIL;
    if (!to) return { status: 'error', message: 'Set ADMIN_EMAIL to receive test sends.' };
    try {
      await sendTest(to, parsed.data.subject, broadcastEmail(parsed.data, 'test'), 'test');
    } catch (err) {
      return { status: 'error', message: `Test send failed: ${(err as Error).message}` };
    }
    return { status: 'ok', message: `Test sent to ${to}.` };
  }

  const [b] = await db.insert(broadcasts).values(parsed.data).returning();
  try {
    const n = await sendBroadcast(b, sgToday());
    await db.update(broadcasts).set({ sentAt: new Date(), recipientCount: n }).where(eq(broadcasts.id, b.id));
    revalidatePath('/admin');
    return { status: 'ok', message: `Sent to ${n} ${n === 1 ? 'subscriber' : 'subscribers'}.` };
  } catch (err) {
    revalidatePath('/admin');
    return { status: 'error', message: `Sending stopped: ${(err as Error).message}. Sending again skips anyone already sent to today.` };
  }
}

export async function runRemindersNow(_prev: AdminState): Promise<AdminState> {
  await requireAdmin();
  try {
    const r = await runDaily(sgToday());
    return { status: 'ok', message: `${r.accountsDue} accounts due today; ${r.remindersSent} reminders, ${r.nudgesSent} nudges and ${r.routinePromptsSent} reset emails sent (anything already sent today is skipped).` };
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}
