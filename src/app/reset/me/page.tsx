import type { Metadata } from 'next';
import { HelpBand, SiteHeader } from '@/components/chrome';
import { DeviceImportBanner, SavedToAccount } from '@/components/guest';
import { GuestReset } from '@/components/GuestReset';
import { ResetDashboard } from '@/components/ResetDashboard';
import { setDailyEmails, stopReset } from '@/app/reset/actions';
import { currentUser } from '@/lib/account';
import { resetFor } from '@/lib/reset';

export const metadata: Metadata = { title: 'My reset' };

type Props = { searchParams: Promise<{ day?: string; saved?: string; 'saved-device'?: string }> };

export default async function MyResetPage({ searchParams }: Props) {
  const me = await currentUser();
  const params = await searchParams;
  // Not signed in: the reset saves on this device, with a way to move it into an account at the bottom.
  if (!me) {
    return (
      <>
        <SiteHeader current="reset" />
        <GuestReset day={params.day} saved={params.saved} />
        <HelpBand />
      </>
    );
  }
  const r = await resetFor(me.user.id);
  const current = r.current;
  return (
    <>
      <SiteHeader current="reset" />
      <ResetDashboard
        data={r}
        who={`Signed in as ${me.subscriber.email}`}
        day={params.day}
        saved={params.saved}
        notice={
          params['saved-device'] ? (
            <SavedToAccount kind="reset" />
          ) : (
            <DeviceImportBanner kind="reset" accountHasActiveReset={current?.status === 'audit' || current?.status === 'trial'} />
          )
        }
        reminders={
          current ? (
            <section className="panel" aria-labelledby="mail-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 id="mail-title" style={{ fontSize: 18 }}>
                Daily reminder
              </h2>
              <form action={setDailyEmails} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, flex: '1 1 200px' }}>
                  <strong>Email me at 8:00 am to log yesterday</strong>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: 14 }}>
                    {current.dailyEmails ? 'On, only for days you haven’t logged.' : 'Off. You’ll still get an email when each step opens.'}
                  </span>
                </span>
                <input type="hidden" name="dailyEmails" value={String(!current.dailyEmails)} />
                <button type="submit" className="btn btn-ghost">
                  {current.dailyEmails ? 'Turn off' : 'Turn on'}
                </button>
              </form>
              <form action={stopReset} style={{ borderTop: '1px solid var(--rule)', paddingTop: 12 }}>
                <button type="submit" className="linkish" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'underline' }}>
                  Stop this reset
                </button>
              </form>
            </section>
          ) : null
        }
      />
      <HelpBand />
    </>
  );
}
