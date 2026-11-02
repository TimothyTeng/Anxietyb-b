'use client';

import { useActionState } from 'react';
import { login, type FormState } from '@/app/actions';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { status: 'idle' });
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input type="hidden" name="next" value={next} />
      <div className="stack">
        <label htmlFor="login-email" className="label">
          Email
        </label>
        <input id="login-email" name="email" type="email" className="field" autoComplete="email" required />
      </div>
      <div className="stack">
        <label htmlFor="login-pw" className="label">
          Password
        </label>
        <input id="login-pw" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      {state.status === 'error' ? (
        <p className="error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-ink" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
