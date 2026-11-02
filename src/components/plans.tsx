'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { addPlan, checkIn, deletePlan, togglePlan, updatePlan, type CheckinState, type FormState } from '@/app/actions';
import type { Plan } from '@/db/schema';
import { MOMENTS } from '@/lib/constants';
import type { WeekCell } from '@/lib/progress';

type PlanLike = Pick<Plan, 'id' | 'moment' | 'ifText' | 'thenText' | 'active'>;
type FormAction = (prev: FormState, form: FormData) => Promise<FormState>;
type FormSubmit = (form: FormData) => void | Promise<void>;

/** Where the plan forms save: the account (the default, server actions) or this device. */
export type PlanActions = {
  add: FormAction;
  update: FormAction;
  toggle: FormSubmit;
  remove: FormSubmit;
  checkIn: (prev: CheckinState, form: FormData) => Promise<CheckinState>;
};
const accountActions: PlanActions = { add: addPlan, update: updatePlan, toggle: togglePlan, remove: deletePlan, checkIn };

function PlanFields({ plan, idPrefix }: { plan?: PlanLike; idPrefix: string }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 16 }}>
        <div className="stack">
          <label htmlFor={`${idPrefix}-if`} className="ifk" style={{ fontSize: 14, letterSpacing: '.06em' }}>
            IF
          </label>
          <input id={`${idPrefix}-if`} name="ifText" className="field" defaultValue={plan?.ifText} placeholder="it's 11pm and I'm still scrolling" maxLength={200} />
        </div>
        <div className="stack">
          <label htmlFor={`${idPrefix}-then`} className="thenk" style={{ fontSize: 14, letterSpacing: '.06em' }}>
            THEN
          </label>
          <input id={`${idPrefix}-then`} name="thenText" className="field" defaultValue={plan?.thenText} placeholder="my phone sleeps outside my room" maxLength={200} />
        </div>
      </div>
      <div className="stack" style={{ maxWidth: 260 }}>
        <label htmlFor={`${idPrefix}-moment`} style={{ fontSize: 14, fontWeight: 600 }}>
          What kind of moment?
        </label>
        <select id={`${idPrefix}-moment`} name="moment" className="field" defaultValue={plan?.moment ?? 'Sleep'}>
          {MOMENTS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function NewPlanForm({ actions = accountActions, guest = false }: { actions?: PlanActions; guest?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(actions.add, { status: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === 'ok') formRef.current?.reset();
  }, [state]);
  return (
    <form id="new-plan" ref={formRef} action={action} className="new-plan">
      <div>
        <h2 style={{ fontSize: 22 }}>Write a new plan</h2>
        <p style={{ marginTop: 4, fontSize: 15, color: 'var(--muted)' }}>
          Make the IF a specific moment and the THEN a small, calming step. <Link href="/how-it-works#stronger">See examples</Link>
        </p>
      </div>
      <PlanFields idPrefix="new" />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <button type="submit" className="btn btn-ink" disabled={pending}>
          {pending ? 'Saving…' : 'Save plan'}
        </button>
        {state.status === 'error' ? (
          <p className="error" role="alert">
            {state.message}
          </p>
        ) : null}
        {state.status === 'ok' ? (
          <p role="status" style={{ fontSize: 14, color: 'var(--green-text)', fontWeight: 600 }}>
            {guest ? 'Saved on this device.' : 'Saved. It’s in your next reminder.'}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function PlanCard({ plan, schedule, actions = accountActions, guest = false }: { plan: PlanLike; schedule: string; actions?: PlanActions; guest?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const result = await actions.update(prev, fd);
    if (result.status === 'ok') setEditing(false);
    return result;
  }, { status: 'idle' });

  if (editing) {
    return (
      <form action={action} className="new-plan" style={{ borderStyle: 'solid' }} aria-label="Edit plan">
        <input type="hidden" name="id" value={plan.id} />
        <PlanFields plan={plan} idPrefix={`edit-${plan.id}`} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <button type="submit" className="btn btn-ink" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 48 }} onClick={() => setEditing(false)}>
            Cancel
          </button>
          {state.status === 'error' ? (
            <p className="error" role="alert">
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <article className={`plan-card${plan.active ? '' : ' paused'}`}>
      <div className="plan-halves">
        <div className="hotbg">
          <span className="kw">IF</span>
          <span className="txt">{plan.ifText}</span>
        </div>
        <div className="coolbg">
          <span className="kw">THEN</span>
          <span className="txt">{plan.thenText}</span>
        </div>
      </div>
      <div className="plan-foot">
        <div className="plan-meta">
          <span className="tag">{plan.moment}</span>
          <span>{guest ? (plan.active ? 'Saved on this device' : 'Paused') : plan.active ? `Reminder: ${schedule}` : 'Reminders paused'}</span>
        </div>
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            Edit
          </button>
          <form action={actions.toggle}>
            <input type="hidden" name="id" value={plan.id} />
            <input type="hidden" name="active" value={String(!plan.active)} />
            <button type="submit" className="btn btn-ghost">
              {guest ? (plan.active ? 'Pause' : 'Resume') : plan.active ? 'Pause reminders' : 'Resume reminders'}
            </button>
          </form>
          <form
            action={actions.remove}
            onSubmit={(e) => {
              if (!confirm('Delete this plan? This cannot be undone.')) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={plan.id} />
            <button type="submit" className="btn btn-ghost" aria-label={`Delete plan: IF ${plan.ifText}`}>
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function Dot({ cell }: { cell: WeekCell }) {
  return (
    <span className={`dot ${cell.state}`} role="img" aria-label={cell.aria}>
      {cell.state === 'done' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export function StreakCard(props: { streak: number; best: number; row: WeekCell[]; outcome: 'ran' | 'missed' | null; actions?: PlanActions }) {
  const [state, action, pending] = useActionState<CheckinState, FormData>((props.actions ?? accountActions).checkIn, { newBadges: [] });
  return (
    <>
      {state.newBadges.length ? (
        <div className="banner" role="status" style={{ marginTop: 0 }}>
          <span className="medal earned" aria-hidden="true" style={{ width: 52, height: 52, fontSize: 24 }}>
            ★
          </span>
          <p style={{ flex: '1 1 240px' }}>
            <strong>New badge: {state.newBadges.join(', ')}.</strong> Nice work keeping it up.
          </p>
        </div>
      ) : null}
      <section className="streak" aria-labelledby="streak-title">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <span className="streak-num">{props.streak}</span>
          <div style={{ paddingBottom: 4 }}>
            <h2 id="streak-title" style={{ fontSize: 20, lineHeight: 1.2 }}>
              week streak
            </h2>
            <p className="on-dark-muted" style={{ marginTop: 2 }}>
              Best: {props.best} {props.best === 1 ? 'week' : 'weeks'}
            </p>
          </div>
        </div>
        <ol className="weeks" aria-label="Recent weeks">
          {props.row.map((cell) => (
            <li key={cell.label}>
              <span className="lbl">{cell.label}</span>
              <Dot cell={cell} />
            </li>
          ))}
        </ol>
        <div className="divider">
          {props.outcome === null ? (
            <>
              <p style={{ fontSize: 17, fontWeight: 600 }}>This week&apos;s check-in: did your plan run?</p>
              <p className="on-dark-muted" style={{ marginTop: 4 }}>
                One plan a week is enough. Either answer keeps your streak going.
              </p>
              <form action={action} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                <button type="submit" name="outcome" value="ran" className="btn btn-orange" disabled={pending}>
                  Yes, it ran
                </button>
                <button type="submit" name="outcome" value="missed" className="btn btn-dark-outline" disabled={pending}>
                  Not this time
                </button>
              </form>
            </>
          ) : props.outcome === 'ran' ? (
            <>
              <p role="status" style={{ fontSize: 17, fontWeight: 600 }}>
                Nice. Your plan ran this week.
              </p>
              <p className="on-dark-muted" style={{ marginTop: 4 }}>
                That&apos;s the fast brain running your plan, not your panic. See you next week.
              </p>
            </>
          ) : (
            <>
              <p role="status" style={{ fontSize: 17, fontWeight: 600 }}>
                Thanks for checking in.
              </p>
              <p className="on-dark-muted" style={{ marginTop: 4 }}>
                Missed moments are useful too. Is the IF specific enough? Is the THEN small enough?{' '}
                <Link href="/how-it-works#stronger" style={{ color: 'var(--mint)' }}>
                  Tune your plan
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
