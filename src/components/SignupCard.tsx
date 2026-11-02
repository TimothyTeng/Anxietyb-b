'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signup, type FormState } from '@/app/actions';

const PERKS = ['Save your if/then plans', 'Weekly email reminders of your plans', 'Streaks and badges'];

function Tick({ on }: { on: boolean }) {
  return on ? (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="10" cy="10" r="9" fill="#2F6B4A" />
      <path d="M6 10.5l2.6 2.5L14 7.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="#A9A193" strokeWidth="1.5" strokeDasharray="3 2.5" />
    </svg>
  );
}

export function SignupCard() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, { status: 'idle' });
  const [hasPw, setHasPw] = useState(false);
  // "Create an account instead" dismisses the current result; the next submit produces a new state object.
  const [dismissed, setDismissed] = useState<FormState | null>(null);
  const done = state !== dismissed && (state.status === 'list' || state.status === 'account') ? state.status : null;

  if (done === 'list') {
    return (
      <div className="signup" role="status" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-text)' }}>
          You&apos;re on the list
        </p>
        <h2 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
          Check your inbox for a welcome note.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--body)' }}>
          Your first calm nudge arrives this week. Want to save your plans and build a streak? Add a password any time.
        </p>
        <button type="button" className="btn btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => setDismissed(state)}>
          Create an account instead
        </button>
      </div>
    );
  }

  if (done === 'account') {
    return (
      <div className="signup" role="status" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-text)' }}>
          Account created
        </p>
        <h2 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
          Next: write your first plan.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--body)' }}>It takes about a minute, and it earns your first badge.</p>
        <Link href="/plans#new-plan" className="btn btn-orange" style={{ alignSelf: 'flex-start' }}>
          Write my first plan →
        </Link>
      </div>
    );
  }

  return (
    <div className="signup">
      <form action={action}>
        <div>
          <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Join the list
          </p>
          <h2 id="join-title" className="d" style={{ marginTop: 6, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
            Get calm nudges in your inbox
          </h2>
          <p style={{ marginTop: 10, fontSize: 16, color: 'var(--body)' }}>Short, positive messages and campaign tips, about once a week.</p>
        </div>
        <div className="stack">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" className="field" type="email" required autoComplete="email" placeholder="you@e.ntu.edu.sg" />
        </div>
        <div className="stack">
          <label htmlFor="pw" className="label">
            Password <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
          </label>
          <input
            id="pw"
            name="password"
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-describedby="pw-help"
            onChange={(e) => setHasPw(e.target.value.length > 0)}
          />
          <p id="pw-help" style={{ fontSize: 14, color: 'var(--muted)' }}>
            Add a password (8+ characters) to create an account and unlock:
          </p>
        </div>
        <ul className="perks">
          {PERKS.map((p) => (
            <li key={p}>
              <Tick on={hasPw} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <label className="consent">
          <input type="checkbox" name="consent" required />
          <span>I agree to receive emails from IF / THEN. I can unsubscribe at any time.</span>
        </label>
        {state.status === 'error' ? (
          <p className="error" role="alert">
            {state.message}{' '}
            {state.message?.includes('Sign in') ? <Link href="/login">Sign in</Link> : null}
          </p>
        ) : null}
        <button type="submit" className="btn btn-orange" style={{ height: 52, fontSize: 17 }} disabled={pending}>
          {pending ? 'Just a moment…' : hasPw ? 'Create my account' : 'Join the email list'}
        </button>
        <p style={{ marginTop: -4, fontSize: 13, color: 'var(--muted)' }}>IF / THEN is a self-help tool, not a crisis service.</p>
      </form>
    </div>
  );
}
