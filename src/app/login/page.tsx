import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/chrome';
import { LoginForm } from '@/components/LoginForm';
import { getSession, safeNext } from '@/lib/session';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  if ((await getSession()).userId) redirect(next);
  return (
    <>
      <SiteHeader />
      <main className="narrow">
        <div className="panel">
          <h1 className="d" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1 }}>
            Sign in
          </h1>
          <p style={{ color: 'var(--body)' }}>
            {next.startsWith('/reset') ? 'Sign in to start or continue your reset. It uses your IF / THEN account.' : 'See your plans, check in for this week and change your reminders.'}
          </p>
          <LoginForm next={next} />
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>
            No account yet? <Link href="/#join">Join with an email and password</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
