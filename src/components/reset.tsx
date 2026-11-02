'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { FormState } from '@/lib/forms';
import { logDay, saveChange, saveReview, startReset } from '@/app/reset/actions';
import { ROUTINE_AREAS, type Followed, type RoutineKey } from '@/lib/constants';
import { ROUTINE_FIELDS } from '@/lib/content';

const idle: FormState = { status: 'idle' };

type FormAction = (prev: FormState, form: FormData) => Promise<FormState>;
/** Where the reset forms save: the account (the default, server actions) or this device. */
export type ResetActions = { start: FormAction; logDay: FormAction; saveChange: FormAction; saveReview: FormAction };
export const accountResetActions: ResetActions = { start: startReset, logDay, saveChange, saveReview };

function Message({ state, ok }: { state: FormState; ok?: string }) {
  if (state.status === 'error')
    return (
      <p className="error" role="alert">
        {state.message}
      </p>
    );
  if (state.status === 'ok' && ok)
    return (
      <p role="status" style={{ fontSize: 14, color: 'var(--green-text)', fontWeight: 600 }}>
        {ok}
      </p>
    );
  return null;
}

function Choices({ name, legend, options, initial, hint }: { name: string; legend: string; options: { value: string; label: string; aria?: string }[]; initial?: string | null; hint?: string }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend style={{ fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 8 }}>{legend}</legend>
      <div className="choices">
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input type="radio" name={name} value={o.value} defaultChecked={initial === o.value} aria-label={o.aria} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {hint ? (
        <p className="m" style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

export function StartResetForm({ options, again, action: save = startReset }: { options: { value: string; label: string }[]; again?: boolean; action?: FormAction }) {
  const [state, action, pending] = useActionState<FormState, FormData>(save, idle);
  return (
    <form action={action} className="new-plan" aria-labelledby="start-title">
      <div>
        <p className="kicker" style={{ color: 'var(--orange-text)' }}>
          STEP 1 · AUDIT
        </p>
        <h2 id="start-title" style={{ marginTop: 4, fontSize: 22 }}>
          {again ? 'Start another reset' : 'Start your audit week'}
        </h2>
        <p style={{ marginTop: 4, fontSize: 15, color: 'var(--muted)' }}>
          For the next 7 days, log roughly how you spent each day and how stressed you felt. Already keeping track? Start from an earlier day and fill those days in.
        </p>
      </div>
      <div className="stack" style={{ maxWidth: 320 }}>
        <label htmlFor="start-day" className="label">
          First day of your audit
        </label>
        <select id="start-day" name="start" className="field" defaultValue={options[0].value}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <button type="submit" className="btn btn-ink" disabled={pending}>
          {pending ? 'Starting…' : 'Start my audit'}
        </button>
        <Message state={state} />
      </div>
    </form>
  );
}

type DayValues = Record<RoutineKey, number> & { stress: number; followed: Followed | null; note: string };

export function DayLogForm({
  day,
  title,
  kicker,
  trial,
  initial,
  saved,
  action: save = logDay,
}: {
  day: string;
  title: string;
  kicker: string;
  trial: boolean;
  initial: DayValues | null;
  saved: string | null;
  action?: FormAction;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(save, idle);
  const sum = (v: Partial<Record<RoutineKey, number>>) => ROUTINE_FIELDS.reduce((t, f) => t + (Number(v[f.key]) || 0), 0);
  const [total, setTotal] = useState(initial ? sum(initial) : 0);
  const over = total > 24;
  return (
    <form
      id="log"
      action={action}
      className="streak on-dark"
      aria-labelledby="log-title"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, scrollMarginTop: 16 }}
      onInput={(e) => {
        const fd = new FormData(e.currentTarget);
        setTotal(sum(Object.fromEntries(ROUTINE_FIELDS.map((f) => [f.key, Number(fd.get(f.key)) || 0]))));
      }}
    >
      <input type="hidden" name="day" value={day} />
      {saved ? (
        <p role="status" style={{ fontSize: 14, color: 'var(--mint)', fontWeight: 600, paddingBottom: 12, borderBottom: '1px solid #333' }}>
          Saved {saved}. It&apos;s on your calendar.{saved === title ? '' : ` Next: ${title}.`}
        </p>
      ) : null}
      <div>
        <p className="kicker" style={{ color: 'var(--yellow)' }}>
          {kicker}
        </p>
        <h2 id="log-title" className="d" style={{ marginTop: 4, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
          {title}
        </h2>
        <p className="on-dark-muted" style={{ marginTop: 4 }}>
          Hours are rough estimates. Half hours are fine.
        </p>
      </div>
      <div className="log-grid">
        {ROUTINE_FIELDS.map((f) => (
          <div key={f.key} className="stack">
            <label htmlFor={`h-${f.key}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
              <span className="swatch" style={{ background: f.color, borderColor: 'var(--grey)' }} aria-hidden="true" />
              {f.label}
            </label>
            <input id={`h-${f.key}`} name={f.key} className="field" type="number" min={0} max={24} step={0.5} inputMode="decimal" defaultValue={initial ? initial[f.key] : ''} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }} aria-live="polite">
          <p className="m on-dark-muted" style={{ fontSize: 12 }}>
            LOGGED
          </p>
          <p className="d" style={{ fontWeight: 800, fontSize: 32, lineHeight: 1, color: over ? 'var(--orange)' : 'var(--cream)' }}>
            {Math.round(total * 10) / 10} / 24 h
          </p>
        </div>
      </div>
      {over ? (
        <p role="alert" style={{ fontSize: 14, color: 'var(--orange)' }}>
          That&apos;s more than 24 hours. Check one of the numbers.
        </p>
      ) : null}
      <Choices
        name="stress"
        legend="How stressed did you feel?"
        initial={initial ? String(initial.stress) : null}
        options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n), aria: `Stress ${n} of 5` }))}
        hint="1 = calm · 5 = very stressed"
      />
      {trial ? (
        <Choices
          name="followed"
          legend="Did you follow your new routine?"
          initial={initial?.followed}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'partly', label: 'Partly' },
            { value: 'no', label: 'Not today' },
          ]}
        />
      ) : null}
      <div className="stack">
        <label htmlFor="note-in" style={{ fontSize: 14, fontWeight: 600 }}>
          {trial ? 'What got in the way?' : 'Anything stress you out today?'} <span style={{ fontWeight: 400, color: 'var(--on-dark-muted)' }}>(optional)</span>
        </label>
        <textarea
          id="note-in"
          name="note"
          className="field"
          maxLength={300}
          defaultValue={initial?.note ?? ''}
          placeholder={trial ? 'A group meeting ran late, so I started an hour later.' : 'Lab report due tomorrow, still not started.'}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <button type="submit" className="btn btn-yellow" disabled={pending || over}>
          {pending ? 'Saving…' : 'Save this day'}
        </button>
        {state.status === 'error' ? (
          <p role="alert" style={{ fontSize: 14, color: 'var(--orange)', fontWeight: 500 }}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function ChangeForm({ startOptions, action: save = saveChange }: { startOptions: { value: string; label: string }[]; action?: FormAction }) {
  const [state, action, pending] = useActionState<FormState, FormData>(save, idle);
  return (
    <form action={action} className="new-plan" aria-labelledby="change-title" style={{ gap: 18 }}>
      <div>
        <p className="kicker" style={{ color: 'var(--orange-text)' }}>
          STEP 2 · SPOT IT
        </p>
        <h2 id="change-title" style={{ marginTop: 4, fontSize: 22 }}>
          Pick one recurring stress, and one realistic change
        </h2>
        <p style={{ marginTop: 4, fontSize: 15, color: 'var(--muted)' }}>Choose something that showed up more than once, and a change you could keep on your busiest day.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 16 }}>
        <div className="stack">
          <label htmlFor="area-in" style={{ fontSize: 14, fontWeight: 600 }}>
            Which part of your routine?
          </label>
          <select id="area-in" name="stressArea" className="field" defaultValue="Study & work">
            {ROUTINE_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="stack">
          <label htmlFor="stressor-in" style={{ fontSize: 14, fontWeight: 600 }}>
            What keeps stressing you?
          </label>
          <input id="stressor-in" name="stressor" className="field" maxLength={200} placeholder="Deadlines pile up and I leave them to the last night" />
        </div>
      </div>
      <div className="change-halves" style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)' }}>
        <div style={{ background: 'var(--sand)', gap: 8 }}>
          <label htmlFor="instead-in" className="m" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.08em' }}>
            INSTEAD OF
          </label>
          <input id="instead-in" name="insteadOf" className="field" maxLength={200} placeholder="staying up till 3am to study the night before" />
        </div>
        <div className="resetbg" style={{ gap: 8 }}>
          <label htmlFor="will-in" className="m" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.08em' }}>
            I WILL
          </label>
          <input id="will-in" name="change" className="field" maxLength={200} placeholder="start revising at least 2 days earlier" />
        </div>
      </div>
      <Choices
        name="start"
        legend="Start your trial week"
        initial={startOptions[0].value}
        options={startOptions}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <button type="submit" className="btn btn-ink" disabled={pending}>
          {pending ? 'Saving…' : 'Start my trial week'}
        </button>
        <Message state={state} />
        <Link href="/how-it-works" style={{ fontSize: 15 }}>
          Add an if/then cue too
        </Link>
      </div>
    </form>
  );
}

const RATINGS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));

export function ReviewForm({ action: save = saveReview }: { action?: FormAction }) {
  const [state, action, pending] = useActionState<FormState, FormData>(save, idle);
  return (
    <form action={action} className="new-plan" aria-labelledby="review-title" style={{ gap: 18 }}>
      <div>
        <p className="kicker" style={{ color: 'var(--green-text)' }}>
          STEP 4 · REVIEW
        </p>
        <h2 id="review-title" style={{ marginTop: 4, fontSize: 22 }}>
          How did your trial week go?
        </h2>
        <p style={{ marginTop: 4, fontSize: 15, color: 'var(--muted)' }}>There are no wrong answers. A change that didn&apos;t stick still tells you what to adjust.</p>
      </div>
      <div className="stack">
        <label htmlFor="obs-in" style={{ fontSize: 14, fontWeight: 600 }}>
          What got in the way?
        </label>
        <textarea id="obs-in" name="obstacles" className="field" maxLength={600} placeholder="A group meeting ran late on Wednesday, and I left quiz revision to Sunday again." />
      </div>
      <div className="stack">
        <label htmlFor="feel-in" style={{ fontSize: 14, fontWeight: 600 }}>
          How did it change your mood, sleep or energy?
        </label>
        <textarea id="feel-in" name="helped" className="field" maxLength={600} placeholder="Less panic the night before. I felt more awake in morning lectures." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 16 }}>
        <Choices name="wellbeingBefore" legend="How you felt before the reset" options={RATINGS.map((r) => ({ ...r, aria: `Before: ${r.label} of 5` }))} hint="1 = struggling · 5 = doing well" />
        <Choices name="wellbeingAfter" legend="How you feel after the trial week" options={RATINGS.map((r) => ({ ...r, aria: `After: ${r.label} of 5` }))} hint="1 = struggling · 5 = doing well" />
      </div>
      <Choices
        name="decision"
        legend="What next?"
        options={[
          { value: 'keep', label: 'Keep it' },
          { value: 'adjust', label: 'Adjust it' },
          { value: 'new', label: 'Try a different change' },
        ]}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <button type="submit" className="btn btn-ink" disabled={pending}>
          {pending ? 'Saving…' : 'Finish my reset'}
        </button>
        <Message state={state} />
      </div>
    </form>
  );
}
