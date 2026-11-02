'use client';

import { useActionState, useDeferredValue, useState } from 'react';
import { adminLogin, runRemindersNow, sendBroadcastAction, type AdminState } from '@/app/admin/actions';
import { POSTERS } from '@/lib/content';

function Result({ state }: { state: AdminState }) {
  if (state.status === 'idle') return null;
  return (
    <p role={state.status === 'error' ? 'alert' : 'status'} className={state.status === 'error' ? 'error' : undefined} style={state.status === 'ok' ? { color: 'var(--green-text)', fontWeight: 600, fontSize: 14 } : undefined}>
      {state.message}
    </p>
  );
}

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(adminLogin, { status: 'idle' });
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stack">
        <label htmlFor="admin-pw" className="label">
          Admin password
        </label>
        <input id="admin-pw" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      <Result state={state} />
      <button type="submit" className="btn btn-ink" disabled={pending}>
        Open admin
      </button>
    </form>
  );
}

export function ComposeForm({ subscribed }: { subscribed: number }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(sendBroadcastAction, { status: 'idle' });
  const [subject, setSubject] = useState('New poster: the night before');
  const [posterKey, setPosterKey] = useState('sleep');
  const [body, setBody] = useState(
    "Spotted this one on your floor? It's for the night before a test, when sleep loses to scrolling.\n\nTear off a tab and write your own plan, or save it on the site so we can remind you.",
  );
  const preview = useDeferredValue(`/admin/preview?${new URLSearchParams({ subject, body, posterKey })}`);

  return (
    <div className="admin-grid">
      <form
        action={action}
        className="panel"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        onSubmit={(e) => {
          const mode = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
          if (mode === 'all' && !confirm(`Send "${subject}" to ${subscribed} subscribers now?`)) e.preventDefault();
        }}
      >
        <h2 style={{ fontSize: 22 }}>Follow-up poster email</h2>
        <div className="stack">
          <label htmlFor="b-subject" className="label">
            Subject
          </label>
          <input id="b-subject" name="subject" className="field" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={140} required />
        </div>
        <div className="stack">
          <label htmlFor="b-poster" className="label">
            Poster
          </label>
          <select id="b-poster" name="posterKey" className="field" value={posterKey} onChange={(e) => setPosterKey(e.target.value)}>
            {POSTERS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}: IF {p.ifText}
              </option>
            ))}
            <option value="">No poster</option>
          </select>
        </div>
        <div className="stack">
          <label htmlFor="b-body" className="label">
            Message
          </label>
          <textarea id="b-body" name="body" className="field" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} required aria-describedby="b-body-help" />
          <p id="b-body-help" style={{ fontSize: 13, color: 'var(--muted)' }}>
            Leave a blank line between paragraphs.
          </p>
        </div>
        <Result state={state} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="submit" name="mode" value="test" className="btn btn-outline" disabled={pending}>
            Send test to me
          </button>
          <button type="submit" name="mode" value="all" className="btn btn-orange" disabled={pending}>
            {pending ? 'Sending…' : `Send to ${subscribed} subscribers`}
          </button>
        </div>
      </form>
      <div>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          Preview
        </p>
        <iframe title="Email preview" src={preview} className="preview-frame" />
      </div>
    </div>
  );
}

export function RunRemindersButton() {
  const [state, action, pending] = useActionState<AdminState>(runRemindersNow, { status: 'idle' });
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <button type="submit" className="btn btn-ghost" style={{ minHeight: 44 }} disabled={pending}>
        {pending ? 'Running…' : "Run today's reminders now"}
      </button>
      <Result state={state} />
    </form>
  );
}
