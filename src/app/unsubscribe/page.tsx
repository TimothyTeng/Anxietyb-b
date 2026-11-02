import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { setUnsubscribed } from '@/app/actions';
import { SiteHeader } from '@/components/chrome';
import { db, subscribers } from '@/db';

export const metadata: Metadata = { title: 'Email preferences', robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; done?: string }> };

// Confirming with a button (not on page load) stops link scanners from unsubscribing people.
export default async function UnsubscribePage({ searchParams }: Props) {
  const { token = '', done } = await searchParams;
  const [sub] = token ? await db.select().from(subscribers).where(eq(subscribers.unsubscribeToken, token)).limit(1) : [];

  return (
    <>
      <SiteHeader />
      <main className="narrow">
        <div className="panel">
          {!sub ? (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                Link not recognised
              </h1>
              <p style={{ color: 'var(--body)' }}>This unsubscribe link has expired or was copied incompletely. Use the link at the bottom of any IF / THEN email.</p>
            </>
          ) : sub.status === 'unsubscribed' ? (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                {done === 'unsubscribed' ? "You're unsubscribed." : "You're not on the list."}
              </h1>
              <p style={{ color: 'var(--body)' }}>
                {sub.email} won&apos;t get any more IF / THEN emails, including plan reminders. Your saved plans stay in your account.
              </p>
              <form action={setUnsubscribed}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="status" value="subscribed" />
                <button type="submit" className="btn btn-outline">
                  Resubscribe
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                {done === 'subscribed' ? "You're back on the list." : 'Stop IF / THEN emails?'}
              </h1>
              <p style={{ color: 'var(--body)' }}>
                {done === 'subscribed'
                  ? `${sub.email} will get calm nudges and campaign news again.`
                  : `${sub.email} will stop getting calm nudges, campaign news and plan reminders.`}
              </p>
              {done === 'subscribed' ? (
                <Link href="/" className="btn btn-orange" style={{ alignSelf: 'flex-start' }}>
                  Back to IF / THEN
                </Link>
              ) : (
                <form action={setUnsubscribed}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="status" value="unsubscribed" />
                  <button type="submit" className="btn btn-ink">
                    Unsubscribe
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
