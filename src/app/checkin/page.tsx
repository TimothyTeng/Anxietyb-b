import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/chrome';
import { recordEmailCheckin } from './actions';

export const metadata: Metadata = { title: 'Check in', robots: { index: false } };

type Props = { searchParams: Promise<{ u?: string; o?: string; s?: string; done?: string }> };

// Links in reminder emails land here. Recording needs a button press, so link scanners can't check people in.
export default async function CheckinPage({ searchParams }: Props) {
  const { u = '', o = '', s = '', done } = await searchParams;
  const ran = o === 'ran';

  return (
    <>
      <SiteHeader />
      <main className="narrow">
        <div className="panel">
          {done === 'ok' ? (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                {ran ? 'Nice. Your plan ran.' : 'Thanks for checking in.'}
              </h1>
              <p style={{ color: 'var(--body)' }}>
                {ran
                  ? "That's the fast brain running your plan, not your panic. Your streak is up to date."
                  : 'Missed moments are useful too. Is the IF specific enough? Is the THEN small enough? Your streak still counts this week.'}
              </p>
              <Link href="/plans" className="btn btn-orange" style={{ alignSelf: 'flex-start' }}>
                See my streak
              </Link>
            </>
          ) : done === 'bad' ? (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                That link didn&apos;t work
              </h1>
              <p style={{ color: 'var(--body)' }}>Sign in to check in for this week instead.</p>
              <Link href="/plans" className="btn btn-ink" style={{ alignSelf: 'flex-start' }}>
                Go to my plans
              </Link>
            </>
          ) : (
            <>
              <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                {ran ? 'Your plan ran this week?' : "Your plan didn't run this week?"}
              </h1>
              <p style={{ color: 'var(--body)' }}>Either answer keeps your streak going.</p>
              <form action={recordEmailCheckin}>
                <input type="hidden" name="u" value={u} />
                <input type="hidden" name="o" value={o} />
                <input type="hidden" name="s" value={s} />
                <button type="submit" className="btn btn-orange">
                  {ran ? 'Yes, check me in' : 'Check me in'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
