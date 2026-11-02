import 'server-only';
import { render } from '@react-email/render';
import { eq, inArray } from 'drizzle-orm';
import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { db, emailLog } from '@/db';
import { sgToday } from './dates';
import { appUrl } from './session';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? 'IF / THEN <onboarding@resend.dev>';

export type Outgoing = {
  subscriberId: number;
  to: string;
  subject: string;
  react: ReactElement;
  unsubscribeToken: string;
  kind: 'welcome' | 'reminder' | 'broadcast' | 'nudge' | 'routine';
  refId?: string;
};

export const unsubscribeUrl = (token: string) => appUrl(`/unsubscribe?token=${encodeURIComponent(token)}`);

async function payload(m: Omit<Outgoing, 'subscriberId' | 'kind' | 'refId'>) {
  const [html, text] = await Promise.all([render(m.react), render(m.react, { plainText: true })]);
  return {
    from: FROM,
    to: m.to,
    subject: m.subject,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${appUrl(`/api/unsubscribe?token=${encodeURIComponent(m.unsubscribeToken)}`)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Without a Resend key, emails are printed to the server console so the site still works locally.
async function deliver(batch: Awaited<ReturnType<typeof payload>>[]): Promise<(string | null)[]> {
  if (!resend) {
    for (const p of batch) console.log(`\n[email:dev] To: ${p.to}\nSubject: ${p.subject}\n${p.text.slice(0, 1200)}\n`);
    return batch.map(() => 'dev');
  }
  if (batch.length === 1) {
    const { data, error } = await resend.emails.send(batch[0]);
    if (error) throw new Error(error.message);
    return [data?.id ?? null];
  }
  const { data, error } = await resend.batch.send(batch);
  if (error) throw new Error(error.message);
  return batch.map((_, i) => data?.data?.[i]?.id ?? null);
}

/**
 * Sends each message at most once per (subscriber, kind, refId, Singapore day): a row in email_log is
 * claimed before sending, so a re-run of the cron or a double-click never sends twice.
 * Returns how many were sent.
 */
export async function sendOnce(messages: Outgoing[], sentOn = sgToday()): Promise<number> {
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const claimed = await db
      .insert(emailLog)
      .values(chunk.map((m) => ({ subscriberId: m.subscriberId, kind: m.kind, refId: m.refId ?? '', sentOn })))
      .onConflictDoNothing()
      .returning({ id: emailLog.id, subscriberId: emailLog.subscriberId });
    const bySubscriber = new Map(claimed.map((c) => [c.subscriberId, c.id]));
    const toSend = chunk.filter((m) => bySubscriber.has(m.subscriberId));
    if (!toSend.length) continue;
    try {
      const ids = await deliver(await Promise.all(toSend.map(payload)));
      sent += toSend.length;
      await Promise.all(
        toSend.map((m, j) =>
          ids[j] ? db.update(emailLog).set({ resendId: ids[j] }).where(eq(emailLog.id, bySubscriber.get(m.subscriberId)!)) : null,
        ),
      );
    } catch (err) {
      await db.delete(emailLog).where(inArray(emailLog.id, [...bySubscriber.values()]));
      throw err;
    }
    if (i + 100 < messages.length) await pause(600);
  }
  return sent;
}

// For admin test sends: no log, no de-duplication.
export async function sendTest(to: string, subject: string, react: ReactElement, unsubscribeToken: string) {
  await deliver([await payload({ to, subject: `[Test] ${subject}`, react, unsubscribeToken })]);
}
