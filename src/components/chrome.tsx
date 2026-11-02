import Link from 'next/link';
import { logout } from '@/app/actions';
import { getSession } from '@/lib/session';

export async function SiteHeader({ current }: { current?: 'campaigns' | 'how' | 'plans' | 'reset' | 'my-reset' }) {
  const session = await getSession();
  const signedIn = Boolean(session.userId);
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="wordmark">
            <span className="i">Anxiety</span> <span className="t">b&amp;b</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/campaigns" aria-current={current === 'campaigns' ? 'page' : undefined}>
            All campaigns
          </Link>
          <Link href="/how-it-works" aria-current={current === 'how' ? 'page' : undefined}>
            IF/THEN
          </Link>
          <Link href="/reset" aria-current={current === 'reset' ? 'page' : undefined}>
            Reset your routine
          </Link>
          <Link href="/plans" aria-current={current === 'plans' ? 'page' : undefined}>
            My plans
          </Link>
          <Link href="/reset/me" aria-current={current === 'my-reset' ? 'page' : undefined}>
            My reset
          </Link>
          {signedIn ? (
            <form action={logout}>
              <button type="submit" className="linkish">
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/#join" className="nav-cta">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function HelpBand() {
  return (
    <section className="help" aria-label="Getting help">
      <div className="wrap">
        <p style={{ fontSize: 18, maxWidth: '40rem' }}>Anxious most days? Anxiety b&amp;b is a self-help campaign, not treatment. Talk to someone today.</p>
        <p className="m" style={{ fontSize: 18, fontWeight: 600 }}>
          mindline 1771 · 24/7 call, text or chat
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>Anxiety b&amp;b · SP0008 Living Well campaign concept</p>
        <nav aria-label="Footer">
          <Link href="/campaigns">All campaigns</Link>
          <Link href="/how-it-works">IF/THEN</Link>
          <Link href="/reset">Reset your routine</Link>
          <Link href="/plans">My plans</Link>
          <Link href="/reset/me">My reset</Link>
          <Link href="/#join">Join the list</Link>
        </nav>
      </div>
    </footer>
  );
}
