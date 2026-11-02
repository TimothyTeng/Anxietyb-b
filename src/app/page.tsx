import Link from 'next/link';
import { HelpBand, SiteFooter, SiteHeader } from '@/components/chrome';
import { Poster } from '@/components/Poster';
import { SignupCard } from '@/components/SignupCard';
import { POSTERS, ROUTINE_FIELDS } from '@/lib/content';

const WAYS = [
  { n: '01 · Email only', color: 'var(--mint)', textColor: 'var(--green-text)', title: 'Join the list', body: 'Periodic positive messages, plan ideas and campaign help, straight to your inbox. No account needed.' },
  { n: '02 · Email + password', color: 'var(--pink)', textColor: 'var(--muted)', title: 'Save your plans', body: 'Keep your if/then statements in one place and choose how often we email you a reminder of them.' },
  { n: '03 · Keep going', color: 'var(--orange)', textColor: 'var(--orange-text)', title: 'Build a streak', body: 'Write or check in on one plan a week to grow your streak, and earn badges for your first plan, your streaks and each kind of anxious moment you plan for.' },
];

const TOUCHPOINTS = [
  { k: 'ON EVERY POSTER', t: 'Tear-off plan tabs', d: 'Blank "IF ___ THEN ___" tabs to fill in on the spot.' },
  { k: 'SCAN THE QR', t: '60-second Plan Builder', d: 'Three prompts: what you want, what gets in the way, your plan.' },
  { k: 'EXAM SEASON', t: 'Plan Walls', d: 'Sticky-note walls of student plans at campus hubs.' },
  { k: 'ON SOCIAL', t: '#IfThenChallenge', d: 'Seven days, one anxious moment a day.' },
];

function Placeholder({ label, kind }: { label: string; kind: string }) {
  return (
    <div className="placeholder">
      <p className="m" style={{ fontSize: 12, color: 'var(--muted)' }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 600 }}>[{kind} idea title]</p>
      <p style={{ color: 'var(--muted)', fontSize: 15 }}>[One-line description and link to its page]</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hotbg hero-if" aria-labelledby="hero-if">
          <div className="wrap">
            <div className="hero-top">
              <span className="m" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                Engagement campaign · Featured
              </span>
              <span className="pill">1:47 AM</span>
            </div>
            <h1 id="hero-if">
              <span className="big-if">IF</span>
              <span className="big-line tilt">it&apos;s 11pm and I&apos;m still scrolling…</span>
            </h1>
          </div>
        </section>
        <div className="zig" aria-hidden="true" />

        <section id="join" className="coolbg hero-then" aria-labelledby="join-title">
          <div className="wrap">
            <div style={{ flex: '1 1 520px', minWidth: 0 }}>
              <p className="big-then" aria-hidden="true">
                THEN
              </p>
              <p className="big-line" style={{ marginTop: 14 }}>
                my phone sleeps outside my room.
              </p>
              <p style={{ marginTop: 32, fontSize: 21, lineHeight: 1.45, maxWidth: '34rem' }}>
                Make the choice before anxiety makes it for you. Write one small plan while you&apos;re calm, so it runs when the anxious moment arrives.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link href="/how-it-works" className="btn btn-outline">
                  How to write a plan →
                </Link>
              </div>
            </div>
            <SignupCard />
          </div>
        </section>

        <section className="section" aria-labelledby="ways-title">
          <div className="wrap">
            <p className="eyebrow">Three ways to take part</p>
            <h2 id="ways-title" className="h2">
              Start small. Go as far as you like.
            </h2>
            <div className="grid-auto" style={{ marginTop: 40 }}>
              {WAYS.map((w) => (
                <div key={w.title} className="way" style={{ borderTopColor: w.color }}>
                  <p className="m" style={{ fontSize: 13, fontWeight: 600, color: w.textColor }}>
                    {w.n}
                  </p>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ideas" className="section" aria-labelledby="ideas-title">
          <div className="wrap">
            <p className="eyebrow">[Campaign name] · All campaigns</p>
            <h2 id="ideas-title" className="h2">
              One campaign, many ways in
            </h2>
            <p className="lede">
              Our ideas sit in two groups. Awareness ideas help students notice anxiety and how it shapes their choices. Engagement ideas give them something to do about
              it.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 40, marginTop: 44, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="cat-head">
                  <h3>Awareness</h3>
                  <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Notice it
                  </span>
                </div>
                <Placeholder label="AWARENESS · IDEA 1" kind="Awareness" />
                <Placeholder label="AWARENESS · IDEA 2" kind="Awareness" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="cat-head">
                  <h3>Engagement</h3>
                  <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Act on it
                  </span>
                </div>
                <article style={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 14px 30px -16px rgba(70,50,20,.5)' }}>
                  <div className="hotbg" style={{ padding: '20px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                    <p className="d" style={{ fontWeight: 900, fontSize: 64, lineHeight: 0.8 }}>
                      IF<span style={{ opacity: 0.45 }}>/</span>THEN
                    </p>
                    <span className="m" style={{ fontSize: 12, fontWeight: 600, background: 'var(--pink)', padding: '4px 10px', borderRadius: 99 }}>
                      FEATURED
                    </span>
                  </div>
                  <div className="zig-sm" aria-hidden="true" />
                  <div className="coolbg" style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>Decide calm. Act automatic.</p>
                    <p style={{ fontSize: 15 }}>
                      Write a short plan that links the moment anxiety usually wins to one small action. Save it, get reminded, and build a streak.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                      <Link href="/how-it-works" className="btn btn-orange" style={{ minHeight: 44, fontSize: 15 }}>
                        How it works
                      </Link>
                      <Link href="#join" className="btn btn-outline" style={{ minHeight: 44, fontSize: 15 }}>
                        Join
                      </Link>
                    </div>
                  </div>
                </article>
                <article style={{ borderRadius: 6, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--rule)', boxShadow: '0 14px 30px -16px rgba(70,50,20,.35)' }}>
                  <div className="resetbg" style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                    <p className="d" style={{ fontWeight: 900, fontSize: 64, lineHeight: 0.8 }}>
                      RESET
                    </p>
                    <span className="m" style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.55)', padding: '4px 10px', borderRadius: 99 }}>
                      2 WEEKS
                    </span>
                  </div>
                  <div aria-hidden="true" style={{ display: 'flex', height: 14 }}>
                    {ROUTINE_FIELDS.map((f, i) => (
                      <span key={f.key} style={{ flex: `${[6.5, 8, 1, 2.5, 4][i]} 1 0px`, background: f.color }} />
                    ))}
                    <span style={{ flex: '2 1 0px', background: 'var(--sand)' }} />
                  </div>
                  <div style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>Reset your routine.</p>
                    <p style={{ fontSize: 15, color: 'var(--body)' }}>
                      Log one week of sleep, study, activity, screen time and rest. Spot what keeps tipping it over, change one thing, and try it for a week.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                      <Link href="/reset" className="btn btn-ink" style={{ minHeight: 44, fontSize: 15 }}>
                        How it works
                      </Link>
                      <Link href="/reset/me" className="btn btn-outline" style={{ minHeight: 44, fontSize: 15 }}>
                        Start my reset
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 0' }} aria-labelledby="campus-title">
          <div className="wrap">
            <p className="eyebrow">IF / THEN on campus</p>
            <h2 id="campus-title" className="h2">
              One poster per anxious moment
            </h2>
            <p className="lede">Each poster hangs where its &quot;if&quot; happens. Tear off a tab and write your own plan on the spot, or scan the code to save it here.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 32, marginTop: 40 }}>
              {POSTERS.map((p) => (
                <figure key={p.key} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Poster poster={p} />
                  <figcaption style={{ fontSize: 15, color: 'var(--muted)' }}>
                    <strong style={{ display: 'block', color: 'var(--ink)' }}>{p.label}</strong>
                    {p.place}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 56 }}>
              {TOUCHPOINTS.map((t) => (
                <div key={t.t} className="tile">
                  <p className="m">{t.k}</p>
                  <p style={{ fontWeight: 600 }}>{t.t}</p>
                  <p style={{ fontSize: 15, color: 'var(--body)' }}>{t.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <HelpBand />
      <SiteFooter />
    </>
  );
}
