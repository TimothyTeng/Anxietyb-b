import type { ReactNode } from 'react';
import { NewPlanForm, PlanCard, StreakCard, type PlanActions } from '@/components/plans';
import type { Moment } from '@/lib/constants';
import type { Badge, WeekCell } from '@/lib/progress';

type PlanLike = { id: number; moment: Moment; ifText: string; thenText: string; active: boolean };

export type PlansView = {
  plans: PlanLike[];
  streak: number;
  best: number;
  row: WeekCell[];
  thisWeekOutcome: 'ran' | 'missed' | null;
  badges: Badge[];
};

/** The My plans page, for an account (server actions) or for plans saved on this device (`guest`). */
export function PlansDashboard(props: {
  who: string;
  view: PlansView;
  schedule: string;
  remindersLabel: string;
  guest?: boolean;
  actions?: PlanActions;
  notice?: ReactNode;
  side: ReactNode;
  after?: ReactNode;
}) {
  const { view: p, guest = false } = props;
  const earned = p.badges.filter((b) => b.earned).length;
  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px 32px' }}>
        <div>
          <p className="eyebrow">{props.who}</p>
          <h1 className="d" style={{ marginTop: 8, fontWeight: 900, fontSize: 'clamp(56px, 7vw, 88px)', lineHeight: 0.9 }}>
            My plans
          </h1>
        </div>
        <a href={p.plans.length ? '#saved' : '#new-plan'} className="btn btn-orange">
          {p.plans.length ? `See my ${p.plans.length} ${p.plans.length === 1 ? 'plan' : 'plans'}` : '+ New plan'}
        </a>
      </div>

      {props.notice}

      <div className="dash">
        <div className="dash-main">
          <NewPlanForm actions={props.actions} guest={guest} />
          <div id="saved" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 16, scrollMarginTop: 16 }}>
            <h2 style={{ fontSize: 22 }}>
              Saved plans{' '}
              <span className="m" style={{ fontSize: 15, fontWeight: 500, color: 'var(--muted)' }}>
                · {p.plans.length}
              </span>
            </h2>
            <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
              {props.remindersLabel}
            </span>
          </div>
          {p.plans.length === 0 ? (
            <div className="panel" style={{ color: 'var(--body)' }}>
              No plans yet. Write your first one above: it takes about a minute and earns your first badge.
            </div>
          ) : (
            p.plans.map((plan) => <PlanCard key={plan.id} plan={plan} schedule={props.schedule} actions={props.actions} guest={guest} />)
          )}
        </div>

        <aside className="dash-side">
          <StreakCard streak={p.streak} best={p.best} row={p.row} outcome={p.thisWeekOutcome} actions={props.actions} />
          {props.side}
        </aside>
      </div>

      <section aria-labelledby="badges-title" style={{ marginTop: 56 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px 24px', borderBottom: '2px solid var(--ink)', paddingBottom: 12 }}>
          <h2 id="badges-title" className="d" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1 }}>
            Badges
          </h2>
          <p className="m" style={{ fontSize: 14, color: 'var(--muted)' }}>
            {earned} of {p.badges.length} earned
          </p>
        </div>
        <ul className="badges">
          {p.badges.map((b) => (
            <li key={b.title}>
              <span className={`medal ${b.earned ? 'earned' : 'locked'}`} aria-hidden="true">
                {b.mark}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600 }}>
                  {b.title}
                  <span className="sr-only">{b.earned ? ' (earned)' : ' (not earned yet)'}</span>
                </p>
                <p style={{ marginTop: 2, fontSize: 14, color: 'var(--muted)' }}>{b.desc}</p>
                <p className="m" style={{ marginTop: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'var(--green-text)' }}>
                  {b.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {props.after}
    </main>
  );
}
