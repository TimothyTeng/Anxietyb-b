import 'server-only';
import bcrypt from 'bcryptjs';
import { asc, eq } from 'drizzle-orm';
import { createElement } from 'react';
import { z } from 'zod';
import { checkins, db, plans, subscribers, users } from '@/db';
import Welcome from '@/emails/Welcome';
import { sgToday } from './dates';
import { sendOnce, unsubscribeUrl } from './email';
import { progressFrom } from './progress';
import { appUrl, getSession, randomToken } from './session';

export const emailSchema = z.email('Enter a valid email address.').transform((s) => s.trim().toLowerCase());

export async function currentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const rows = await db
    .select({ user: users, subscriber: subscribers })
    .from(users)
    .innerJoin(subscribers, eq(users.subscriberId, subscribers.id))
    .where(eq(users.id, session.userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function progressFor(userId: number, today = sgToday()) {
  const [planRows, checkinRows] = await Promise.all([
    db.select().from(plans).where(eq(plans.userId, userId)).orderBy(asc(plans.createdAt)),
    db.select().from(checkins).where(eq(checkins.userId, userId)),
  ]);
  return progressFrom(planRows, checkinRows, today);
}

export async function sendWelcome(subscriberId: number, email: string, token: string, account: boolean) {
  try {
    await sendOnce([
      {
        subscriberId,
        to: email,
        subject: account ? 'Your IF / THEN account is ready' : "You're on the IF / THEN list",
        react: createElement(Welcome, { account, plansUrl: appUrl('/plans'), howUrl: appUrl('/how-it-works'), unsubscribeUrl: unsubscribeUrl(token) }),
        unsubscribeToken: token,
        kind: 'welcome',
        refId: account ? 'account' : 'list',
      },
    ]);
  } catch (err) {
    console.error('Welcome email failed', err);
  }
}

/** Adds a password account for an email, joining (or rejoining) the email list. The caller has the student's consent to email them. */
export async function createAccount(email: string, password: string): Promise<{ userId: number } | { error: string }> {
  if (password.length < 8) return { error: 'Passwords need at least 8 characters.' };
  let [sub] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  if (!sub) {
    [sub] = await db.insert(subscribers).values({ email, unsubscribeToken: randomToken() }).returning();
  } else if (sub.status === 'unsubscribed') {
    [sub] = await db.update(subscribers).set({ status: 'subscribed', consentAt: new Date() }).where(eq(subscribers.id, sub.id)).returning();
  }
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.subscriberId, sub.id)).limit(1);
  if (existing) return { error: 'You already have an account with this email. Sign in instead.' };
  const [user] = await db.insert(users).values({ subscriberId: sub.id, passwordHash: await bcrypt.hash(password, 10) }).returning();
  await sendWelcome(sub.id, email, sub.unsubscribeToken, true);
  return { userId: user.id };
}

export async function checkPassword(emailInput: unknown, passwordInput: unknown): Promise<{ id: number } | { error: string }> {
  const email = emailSchema.safeParse(emailInput);
  const password = typeof passwordInput === 'string' ? passwordInput : '';
  if (!email.success || !password) return { error: 'Enter your email and password.' };
  const [row] = await db
    .select({ id: users.id, hash: users.passwordHash })
    .from(users)
    .innerJoin(subscribers, eq(users.subscriberId, subscribers.id))
    .where(eq(subscribers.email, email.data))
    .limit(1);
  if (!row || !(await bcrypt.compare(password, row.hash))) return { error: "That email and password don't match." };
  return { id: row.id };
}
