import type { Metadata } from 'next';
import Link from 'next/link';
import { setFrequency, setNudges } from '@/app/actions';
import { HelpBand, SiteHeader } from '@/components/chrome';
import { DeviceImportBanner, SavedToAccount } from '@/components/guest';
import { GuestPlans } from '@/components/GuestPlans';
import { PlansDashboard } from '@/components/PlansDashboard';
import { REMINDER_FREQS } from '@/lib/constants';
import { currentUser, progressFor } from '@/lib/account';
import { resetFor } from '@/lib/reset';
import { FREQ_LABELS, FREQ_SCHEDULE } from '@/lib/content';

export const metadata: Metadata = { title: 'My plans' };

type Props = { searchParams: Promise<{ 'saved-device'?: string }> };

export default async function PlansPage({ searchParams }: Props) {
  const me = await currentUser();
  // Not signed in: plans save on this device, with a way to move them into an account at the bottom.
  if (!me) {
    return (
      <>
        <SiteHeader current="plans" />
        <GuestPlans />
        <HelpBand />
      </>
    );
  }
  const savedDevice = Boolean((await searchParams)['saved-device']);
  const [p, reset] = await Promise.all([progressFor(me.user.id), resetFor(me.user.id)]);
  const resetStatus: Record<string, string> = {
    start: 'Track one week, change one thing, try it for a week.',
    audit: `Audit week · ${reset.auditRows.length} of 7 days logged`,
    plan: 'Audit done · time to choose your change',
    trial: `Trial week · ${reset.trialRows.length} of 7 days logged`,
    review: 'Trial done · time to review',
    done: 'Last reset complete · start another any time',
  };
  const freq = me.user.reminderFreq;

  return (
    <>
      <SiteHeader current="plans" />
      <PlansDashboard
        who={`Signed in as ${me.subscriber.email}`}
        view={p}
        schedule={FREQ_SCHEDULE[freq]}
        remindersLabel={`Reminders: ${FREQ_LABELS[freq].toLowerCase()}`}
        notice={
          savedDevice ? (
            <SavedToAccount kind="plans" />
          ) : (
            <DeviceImportBanner kind="plans" accountHasActiveReset={reset.current?.status === 'audit' || reset.current?.status === 'trial'} />
          )
        }
        side={
          <>
            <section className="panel" aria-labelledby="rem-title" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 id="rem-title" style={{ fontSize: 20 }}>
                  Email reminders
                </h2>
                <p style={{ marginTop: 4, fontSize: 14, color: 'var(--muted)' }}>
                  We email one of your active plans back to you at 8:00 am, so the cue and the plan meet.
                </p>
              </div>
              <form action={setFrequency}>
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend style={{ fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 8 }}>How often</legend>
                  <div className="pills">
                    {REMINDER_FREQS.map((f) => (
                      <button key={f} type="submit" name="freq" value={f} className="pill-btn" aria-pressed={f === freq}>
                        {FREQ_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </form>
              <p style={{ fontSize: 14, color: 'var(--body)' }}>Next reminders: {FREQ_SCHEDULE[freq]}.</p>
              <form action={setNudges} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, flex: '1 1 200px' }}>
                  <strong>Calm nudges</strong>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: 14 }}>
                    {me.subscriber.nudges ? 'On: a short positive message every Monday.' : 'Off.'}
                  </span>
                </span>
                <input type="hidden" name="nudges" value={String(!me.subscriber.nudges)} />
                <button type="submit" className="btn btn-ghost">
                  {me.subscriber.nudges ? 'Turn off' : 'Turn on'}
                </button>
              </form>
            </section>

            <section className="resetbg" aria-labelledby="reset-title" style={{ borderRadius: 6, padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="kicker" style={{ color: 'var(--ink)' }}>
                RESET YOUR ROUTINE
              </p>
              <h2 id="reset-title" style={{ fontSize: 20 }}>
                {reset.step === 'start' ? 'Try a two-week reset' : 'Your reset'}
              </h2>
              <p style={{ fontSize: 15 }}>{resetStatus[reset.step]}</p>
              <Link href="/reset/me" className="btn btn-ink" style={{ alignSelf: 'flex-start', minHeight: 44, fontSize: 15 }}>
                {reset.step === 'start' ? 'Start my reset' : 'Open my reset'}
              </Link>
            </section>
          </>
        }
      />
      <HelpBand />
    </>
  );
}
