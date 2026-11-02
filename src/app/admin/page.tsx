import type { Metadata } from 'next';
import { count, desc, eq, inArray } from 'drizzle-orm';
import { AdminLoginForm, ComposeForm, RunRemindersButton } from '@/components/admin';
import { broadcasts, checkins, db, plans, resets, subscribers, users } from '@/db';
import { sgToday, weekStartOf } from '@/lib/dates';
import { getSession } from '@/lib/session';
import { adminLogout } from './actions';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.admin) {
    return (
      <main className="narrow">
        <div className="panel">
          <h1 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
            IF / THEN admin
          </h1>
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const [[subscribed], [unsubscribed], [accounts], [activePlans], [weekCheckins], [resetsActive], [resetsDone], history] = await Promise.all([
    db.select({ n: count() }).from(subscribers).where(eq(subscribers.status, 'subscribed')),
    db.select({ n: count() }).from(subscribers).where(eq(subscribers.status, 'unsubscribed')),
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(plans).where(eq(plans.active, true)),
    db.select({ n: count() }).from(checkins).where(eq(checkins.weekStart, weekStartOf(sgToday()))),
    db.select({ n: count() }).from(resets).where(inArray(resets.status, ['audit', 'trial'])),
    db.select({ n: count() }).from(resets).where(eq(resets.status, 'done')),
    db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).limit(20),
  ]);

  const stats = [
    ['On the list', subscribed.n],
    ['Accounts', accounts.n],
    ['Active plans', activePlans.n],
    ['Check-ins this week', weekCheckins.n],
    ['Resets in progress', resetsActive.n],
    ['Resets completed', resetsDone.n],
    ['Unsubscribed', unsubscribed.n],
  ] as const;

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 72, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p className="eyebrow">IF / THEN · Campaign admin</p>
          <h1 className="d" style={{ marginTop: 8, fontWeight: 900, fontSize: 64, lineHeight: 0.9 }}>
            Email list
          </h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href="/admin/subscribers.csv" className="btn btn-ghost" style={{ minHeight: 44 }}>
            Export subscribers (CSV)
          </a>
          <form action={adminLogout}>
            <button type="submit" className="btn btn-ghost" style={{ minHeight: 44 }}>
              Sign out of admin
            </button>
          </form>
        </div>
      </div>

      <section aria-label="Numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {stats.map(([label, n]) => (
          <div key={label} className="panel">
            <p className="stat">{n}</p>
            <p className="m" style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)' }}>
              {label}
            </p>
          </div>
        ))}
      </section>

      <section aria-label="Compose">
        <ComposeForm subscribed={subscribed.n} />
      </section>

      <section className="panel" aria-labelledby="sched-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 id="sched-title" style={{ fontSize: 22 }}>
          Automatic emails
        </h2>
        <p style={{ color: 'var(--body)', fontSize: 15 }}>
          Every day at 8:00 am Singapore time, accounts due a reminder get one of their active plans by email. Every Monday, everyone on the list with calm nudges on gets
          the week&apos;s nudge. Students doing a reset get at most one reset email a day: a nudge to log yesterday, or a note when their next step opens. Nobody
          gets the same email twice in a day.
        </p>
        <RunRemindersButton />
      </section>

      <section aria-labelledby="hist-title">
        <h2 id="hist-title" style={{ fontSize: 22, marginBottom: 12 }}>
          Sent broadcasts
        </h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nothing sent yet.</p>
        ) : (
          <div className="table-box" style={{ marginTop: 0 }}>
            <table className="history">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Poster</th>
                  <th scope="col">Recipients</th>
                  <th scope="col">Sent</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b) => (
                  <tr key={b.id}>
                    <td>{b.subject}</td>
                    <td>{b.posterKey ?? '—'}</td>
                    <td>{b.recipientCount}</td>
                    <td>{b.sentAt ? b.sentAt.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }) : 'Not finished'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
