import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpBand, SiteFooter, SiteHeader } from '@/components/chrome';
import { RESET_EXAMPLES, RESET_STEPS, ROUTINE_FIELDS } from '@/lib/content';
import type { RoutineKey } from '@/lib/constants';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Reset your routine',
  description: 'Track one week of sleep, study, activity, screen time and rest. Change one thing, then try it for a week.',
};

type Day = Record<RoutineKey, number>;
const HERO_DAYS: { title: string; stress: number; day: Day; note: string }[] = [
  { title: 'Audit week · Tuesday', stress: 4, day: { sleep: 5, study: 10, active: 0, rest: 1.5, screen: 5 }, note: 'Up till 3am on a lab report due Wednesday.' },
  { title: 'Trial week · Tuesday', stress: 2, day: { sleep: 7.5, study: 7.5, active: 1, rest: 2.5, screen: 3.5 }, note: 'Started the essay on Sunday, so the night before was free.' },
];

function HeroBar({ day }: { day: Day }) {
  const used = ROUTINE_FIELDS.reduce((t, f) => t + day[f.key], 0);
  return (
    <span className="daybar-h" aria-hidden="true">
      {ROUTINE_FIELDS.map((f) => (
        <span key={f.key} style={{ flex: `${day[f.key]} 1 0px`, background: f.color }} />
      ))}
      <span style={{ flex: `${24 - used} 1 0px`, background: 'var(--sand)', borderRight: 0 }} />
    </span>
  );
}

export default async function ResetPage() {
  const signedIn = Boolean((await getSession()).userId);
  const startHref = '/reset/me';
  return (
    <>
      <SiteHeader current="reset" />
      <main>
        <section className="resetbg hero-reset" aria-labelledby="hero-title">
          <div className="wrap">
            <div style={{ flex: '1 1 520px', minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                <span className="m" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  Engagement campaign · Idea 2
                </span>
                <span className="pill">3:00 AM → 11:30 PM</span>
              </div>
              <h1 id="hero-title">
                <span className="big-reset">RESET</span>
                <span className="big-line" style={{ marginTop: 14, maxWidth: 'none' }}>
                  your routine.
                </span>
              </h1>
              <p style={{ marginTop: 28, fontSize: 21, lineHeight: 1.45, maxWidth: '36rem' }}>
                Anxiety often hides in the routine itself: late nights, packed days, no time to move. Track one week, change one thing, then try it for a week.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
                <Link href={startHref} className="btn btn-ink">
                  Start my reset →
                </Link>
                <a href="#steps" className="btn btn-outline">
                  How it works
                </a>
              </div>
            </div>
            <figure aria-labelledby="day-cap" className="signup" style={{ margin: 0, flex: '1 1 380px', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p id="day-cap" className="kicker">
                THE SAME TUESDAY, ONE CHANGE APART
              </p>
              {HERO_DAYS.map((d) => (
                <div key={d.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <p style={{ fontWeight: 600 }}>{d.title}</p>
                    <p className="m" style={{ fontSize: 13, color: 'var(--body)' }}>
                      Stress {d.stress}/5
                    </p>
                  </div>
                  <span role="img" aria-label={`${d.title}: ${ROUTINE_FIELDS.map((f) => `${d.day[f.key]} h ${f.label.toLowerCase()}`).join(', ')}. Stress ${d.stress} of 5.`}>
                    <HeroBar day={d.day} />
                  </span>
                  <p style={{ fontSize: 14, color: 'var(--body)' }}>{d.note}</p>
                </div>
              ))}
              <ul className="key" aria-label="Colour key">
                {ROUTINE_FIELDS.map((f) => (
                  <li key={f.key}>
                    <span className="swatch" style={{ background: f.color }} aria-hidden="true" />
                    {f.label}
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        </section>

        <section id="steps" className="section" aria-labelledby="steps-title">
          <div className="wrap">
            <p className="eyebrow">How a reset works · about two weeks</p>
            <h2 id="steps-title" className="h2">
              Audit, change, try, review
            </h2>
            <p className="lede">You don&apos;t need to fix your whole life. You need to see one week clearly, then change the one thing that keeps tipping it over.</p>
            <ol className="steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 20 }}>
              {RESET_STEPS.map((s) => (
                <li key={s.title} style={{ borderTop: `5px solid ${s.color}`, gap: 10 }}>
                  <p className="kicker">{s.when}</p>
                  <p className="d" style={{ fontWeight: 900, fontSize: 44, lineHeight: 0.9 }}>
                    {s.title}
                  </p>
                  <p style={{ color: 'var(--body)' }}>{s.body}</p>
                  <p className="eg">{s.eg}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" aria-labelledby="ex-title">
          <div className="wrap">
            <p className="eyebrow">Make it realistic</p>
            <h2 id="ex-title" className="h2">
              Small changes survive the week
            </h2>
            <p className="lede">
              &quot;I&apos;ll sleep eight hours every night&quot; rarely lasts past Wednesday. Aim at the habit behind your stress, and make the new step something you could
              do on your busiest day.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 36 }}>
              {RESET_EXAMPLES.map((e) => (
                <div key={e.change} className="ex-pair">
                  <div>
                    <p className="kicker">INSTEAD OF</p>
                    <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>{e.insteadOf}</p>
                    <p className="m" style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                      {e.area}
                    </p>
                  </div>
                  <div>
                    <p className="kicker" style={{ color: 'var(--green-text)' }}>
                      I WILL
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>{e.change}.</p>
                    <p style={{ marginTop: 4, fontSize: 15, color: 'var(--muted)' }}>{e.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="why-title">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 64px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 420px', minWidth: 0 }}>
              <p className="eyebrow">Why the routine</p>
              <h2 id="why-title" className="h2">
                Anxiety feeds on a tired, packed week
              </h2>
              <p style={{ marginTop: 14, color: 'var(--body)' }}>
                Short sleep, no movement and back-to-back deadlines leave less room to cope when stress arrives. Writing the week down shows you the pattern, which is
                hard to see from inside it.
              </p>
            </div>
            <ul className="evidence" style={{ flex: '1 1 520px', minWidth: 0, marginTop: 0 }}>
              <li>
                <span className="m" style={{ flex: '0 0 160px', fontWeight: 600, fontSize: 18, color: 'var(--green-text)' }}>
                  75.6% vs 20%
                </span>
                <span style={{ flex: '1 1 260px', minWidth: 0 }}>
                  NTU students who know they need 7–9 hours of sleep, compared with those who get it. <span style={{ color: 'var(--muted)', fontSize: 15 }}>(NTU, 2018)</span>
                </span>
              </li>
              <li>
                <span className="m" style={{ flex: '0 0 160px', fontWeight: 600, fontSize: 18, color: 'var(--green-text)' }}>
                  150 min
                </span>
                <span style={{ flex: '1 1 260px', minWidth: 0 }}>
                  Of moderate activity a week is the minimum recommended for adults. A daily 20-minute walk gets you there.{' '}
                  <span style={{ color: 'var(--muted)', fontSize: 15 }}>(WHO, 2020) [confirm]</span>
                </span>
              </li>
              <li>
                <span className="m" style={{ flex: '0 0 160px', fontWeight: 600, fontSize: 18, color: 'var(--green-text)' }}>
                  [Figure]
                </span>
                <span style={{ flex: '1 1 260px', minWidth: 0 }}>
                  [Finding linking sleep loss or screen time to anxiety in young people.] <span style={{ color: 'var(--muted)', fontSize: 15 }}>([Source, year])</span>
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section style={{ padding: '64px 0' }} aria-labelledby="pair-title">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
            <div className="tile" style={{ flex: '1 1 480px', minWidth: 0, padding: 28, gap: 10 }}>
              <p className="m">WORKS WITH IF / THEN</p>
              <h2 id="pair-title" style={{ fontSize: 24, lineHeight: 1.25 }}>
                Give your change a cue
              </h2>
              <p style={{ color: 'var(--body)' }}>
                Your reset says what to change. An if/then plan says when.{' '}
                <span className="m" style={{ fontSize: 15 }}>
                  <span className="ifk">IF</span> a deadline is 2 days away, <span className="thenk">THEN</span> I open the brief tonight.
                </span>
              </p>
              <Link href="/how-it-works" style={{ alignSelf: 'flex-start', marginTop: 6, fontWeight: 600 }}>
                Write an if/then plan →
              </Link>
            </div>
            <div className="streak" style={{ flex: '1 1 340px', minWidth: 0, padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="kicker" style={{ color: 'var(--on-dark-muted)' }}>
                ONE ACCOUNT
              </p>
              <p style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.25 }}>No account needed to start.</p>
              <p className="on-dark-muted" style={{ fontSize: 15 }}>
                Your reset saves on this device. Sign in or create a free account any time to keep it, and get a short email reminder to log each day. It&apos;s the
                same account as your if/then plans.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                <Link href={startHref} className="btn btn-yellow">
                  Start my reset →
                </Link>
                {signedIn ? null : (
                  <Link href="/login?next=/reset/me" className="btn btn-dark-outline">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <HelpBand />
      <SiteFooter />
    </>
  );
}
