'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { saveGuest } from '@/app/guest/actions';
import type { FormState } from '@/lib/forms';
import { clearGuest, guestPayload, hasGuestData, readGuest, useGuest } from '@/lib/guest';

type Kind = 'plans' | 'reset';
const TARGET: Record<Kind, string> = { plans: '/plans?saved-device=1', reset: '/reset/me?saved-device=1' };

/** Sends this device's data with the form; on success clears it here and opens the signed-in page. */
function useSaveGuest(kind: Kind) {
  const router = useRouter();
  return useActionState<FormState, FormData>(async (prev, fd) => {
    fd.set('payload', JSON.stringify(guestPayload(readGuest())));
    const result = await saveGuest(prev, fd);
    if (result.status === 'ok') {
      clearGuest();
      router.push(TARGET[kind]);
      router.refresh();
    }
    return result;
  }, { status: 'idle' });
}

function Problem({ state }: { state: FormState }) {
  return state.status === 'error' ? (
    <p className="error" role="alert">
      {state.message}{' '}
      {state.message?.includes('Sign in instead') ? <a href="#signin-title">Sign in</a> : null}
    </p>
  ) : null;
}

/** Both the device and the account have a reset in progress: the student picks which one to keep. */
function KeepWhich({ kind }: { kind: Kind }) {
  const [state, action, pending] = useSaveGuest(kind);
  return (
    <form action={action} className="panel" role="alert" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="mode" value="import" />
      <h3 style={{ fontSize: 20 }}>You&apos;re signed in. Which reset do you want to keep going?</h3>
      <p style={{ color: 'var(--body)', fontSize: 15 }}>
        Your account already has a reset in progress, and so does this device. Your if/then plans and any finished resets are saved either way.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button type="submit" name="resetChoice" value="device" className="btn btn-ink" disabled={pending}>
          Keep the one on this device
        </button>
        <button type="submit" name="resetChoice" value="account" className="btn btn-outline" disabled={pending}>
          Keep the one in my account
        </button>
      </div>
      <Problem state={state} />
    </form>
  );
}

/** The bottom-of-page section for students who haven't signed in. */
export function GuestSave({ kind }: { kind: Kind }) {
  const guest = useGuest();
  const [created, createAction, creating] = useSaveGuest(kind);
  const [signedIn, signInAction, signingIn] = useSaveGuest(kind);
  const plans = guest?.plans.length ?? 0;
  const days = guest ? guest.days.filter((d) => guest.resets.some((r) => r.id === d.resetId && r.status !== 'stopped')).length : 0;
  const what =
    kind === 'plans'
      ? plans
        ? `Your ${plans === 1 ? 'plan' : `${plans} plans`} and your streak are`
        : 'Anything you save here is'
      : days
        ? `Your ${days} logged ${days === 1 ? 'day is' : 'days are'}`
        : 'Your reset is';
  const conflict = created.status === 'conflict' || signedIn.status === 'conflict';
  return (
    <section id="save" aria-labelledby="save-title" className={kind === 'plans' ? 'coolbg save-band' : 'resetbg save-band'}>
      <div style={{ maxWidth: '44rem' }}>
        <p className="m" style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          {kind === 'plans' ? 'Keep your plans' : 'Keep your reset'}
        </p>
        <h2 id="save-title" className="h2">
          {kind === 'plans' ? 'Save them to an account' : 'Save it to an account'}
        </h2>
        <p style={{ marginTop: 10, fontSize: 17 }}>
          {what} on this device for now. Sign in or create a free account to keep {kind === 'plans' ? 'them' : 'it'} anywhere, get{' '}
          {kind === 'plans' ? 'them emailed back as reminders' : 'an 8:00 am reminder to log'}, and join the IF / THEN mailing list.
          {kind === 'reset' ? ' It’s the same account as your if/then plans.' : ''}
        </p>
      </div>
      {conflict ? (
        <KeepWhich kind={kind} />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
          <form action={createAction} className="signup" aria-labelledby="new-acct-title" style={{ flex: '1 1 340px', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="hidden" name="mode" value="create" />
            <h3 id="new-acct-title" style={{ fontSize: 22 }}>
              New here? Create an account
            </h3>
            <div className="stack">
              <label htmlFor="na-email" className="label">
                Email
              </label>
              <input id="na-email" name="email" className="field" type="email" required autoComplete="email" placeholder="you@e.ntu.edu.sg" />
            </div>
            <div className="stack">
              <label htmlFor="na-pw" className="label">
                Password <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(8+ characters)</span>
              </label>
              <input id="na-pw" name="password" className="field" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <label className="consent">
              <input type="checkbox" name="consent" required />
              <span>
                Add me to the IF / THEN mailing list: {kind === 'plans' ? 'plan' : 'reset'} reminders, calm nudges and campaign news. I can unsubscribe at any time.
              </span>
            </label>
            <Problem state={created} />
            <button type="submit" className={kind === 'plans' ? 'btn btn-orange' : 'btn btn-ink'} disabled={creating}>
              {creating ? 'Saving…' : kind === 'plans' ? 'Save my plans and join' : 'Save my reset and join'}
            </button>
          </form>
          <form action={signInAction} className="panel" aria-labelledby="signin-title" style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="hidden" name="mode" value="signin" />
            <h3 id="signin-title" style={{ fontSize: 22 }}>
              Already have an account?
            </h3>
            <div className="stack">
              <label htmlFor="si-email" className="label">
                Email
              </label>
              <input id="si-email" name="email" className="field" type="email" required autoComplete="email" />
            </div>
            <div className="stack">
              <label htmlFor="si-pw" className="label">
                Password
              </label>
              <input id="si-pw" name="password" className="field" type="password" required autoComplete="current-password" />
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              {kind === 'plans'
                ? 'The plans on this device are added to the ones already in your account.'
                : 'This reset is added to your account. If one is already in progress there, you choose which to keep.'}
            </p>
            <Problem state={signedIn} />
            <button type="submit" className="btn btn-ink" style={{ marginTop: 'auto' }} disabled={signingIn}>
              {signingIn ? 'Signing in…' : 'Sign in and save'}
            </button>
          </form>
        </div>
      )}
      <p style={{ fontSize: 15 }}>
        Only want the emails?{' '}
        <Link href="/#join" style={{ color: 'var(--ink)', fontWeight: 600 }}>
          Join the mailing list with just your email
        </Link>
        .
      </p>
    </section>
  );
}

/** The dashed note at the top of a not-signed-in page. */
export function DeviceNote({ kind }: { kind: Kind }) {
  return (
    <div role="note" className="device-note">
      <p style={{ flex: '1 1 320px', fontSize: 15 }}>
        <strong>Saved on this device only.</strong> No account needed to start. Clear your browser or switch phones and your{' '}
        {kind === 'plans' ? 'plans are' : 'logged days are'} gone.
      </p>
      <a href="#save" style={{ fontWeight: 600, fontSize: 15 }}>
        Keep them with a free account ↓
      </a>
    </div>
  );
}

/** Reminders need somewhere to send them. */
export function GuestReminders({ kind }: { kind: Kind }) {
  return (
    <section className="panel" aria-labelledby="rem-guest-title" style={{ borderStyle: 'dashed', borderColor: 'var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 id="rem-guest-title" style={{ fontSize: 20 }}>
        {kind === 'plans' ? 'Email reminders' : 'Daily reminder'}
      </h2>
      <p style={{ fontSize: 15, color: 'var(--body)' }}>
        {kind === 'plans'
          ? 'We can email your plans back to you, so the cue and the plan meet. Reminders need an account, because we need somewhere to send them.'
          : 'A short 8:00 am email to log yesterday makes the audit much easier to keep up. Reminders need an account.'}
      </p>
      <a href="#save" style={{ alignSelf: 'flex-start', fontWeight: 600, fontSize: 15 }}>
        Turn on reminders ↓
      </a>
    </section>
  );
}

/** Signed in, but this device still has plans or a reset from before: offer to move them in. */
export function DeviceImportBanner({ kind, accountHasActiveReset }: { kind: Kind; accountHasActiveReset: boolean }) {
  const guest = useGuest();
  const [state, action, pending] = useSaveGuest(kind);
  if (!hasGuestData(guest)) return null;
  // Both have a reset going (often straight after "Sign in and save"): ask which to keep before anything else.
  const deviceHasActiveReset = guest!.resets.some((r) => r.status === 'audit' || r.status === 'trial');
  if (state.status === 'conflict' || (deviceHasActiveReset && accountHasActiveReset)) return <KeepWhich kind={kind} />;
  const plans = guest!.plans.length;
  const reset = guest!.resets.some((r) => r.status !== 'stopped');
  const what = [plans ? `${plans} ${plans === 1 ? 'plan' : 'plans'}` : '', reset ? 'a reset' : ''].filter(Boolean).join(' and ');
  return (
    <form action={action} className="device-note" style={{ borderStyle: 'solid' }}>
      <input type="hidden" name="mode" value="import" />
      <p style={{ flex: '1 1 320px', fontSize: 15 }}>
        <strong>This device has {what} saved from before you signed in.</strong> Add {plans + (reset ? 1 : 0) === 1 ? 'it' : 'them'} to your account?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="submit" className="btn btn-ink" style={{ minHeight: 44 }} disabled={pending}>
          {pending ? 'Adding…' : 'Add to my account'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ minHeight: 44 }}
          onClick={() => {
            if (confirm('Delete what’s saved on this device? This cannot be undone.')) clearGuest();
          }}
        >
          Delete from this device
        </button>
      </div>
      <Problem state={state} />
    </form>
  );
}

/** Shown once after moving a device's data into the account. */
export function SavedToAccount({ kind }: { kind: Kind }) {
  return (
    <div role="status" className="banner" style={{ marginTop: 24 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={{ flex: 'none' }}>
        <circle cx="11" cy="11" r="10" fill={kind === 'plans' ? 'var(--mint)' : 'var(--yellow)'} />
        <path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ flex: '1 1 300px', fontSize: 15 }}>
        <strong>Saved to your account.</strong> {kind === 'plans' ? 'Your plans moved from this device, and reminders are on.' : 'Your reset moved from this device, and we’ll email you when each step opens.'}
      </p>
    </div>
  );
}
