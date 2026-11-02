import Link from 'next/link';
import { HelpBand, SiteFooter, SiteHeader } from '@/components/chrome';
import { Poster } from '@/components/Poster';
import { SignupCard } from '@/components/SignupCard';
import { AwarenessTile, IfThenCard, ResetCard } from '@/components/campaigns';
import { AWARENESS_GROUPS, POSTERS } from '@/lib/content';

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
            <p className="eyebrow">Anxiety b&amp;b · All campaigns</p>
            <h2 id="ideas-title" className="h2">
              One campaign, many ways in
            </h2>
            <p className="lede">
              Our ideas sit in two groups. Awareness ideas meet youths on the commute, so they notice anxiety and try a quick way to ease it. Engagement ideas give them
              something to keep doing about it.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: 40, marginTop: 44, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="cat-head">
                  <h3>Awareness</h3>
                  <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Notice it
                  </span>
                </div>
                {AWARENESS_GROUPS.flatMap((g) => g.ideas).map((idea) => (
                  <AwarenessTile key={idea.id} idea={idea} />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="cat-head">
                  <h3>Engagement</h3>
                  <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Act on it
                  </span>
                </div>
                <IfThenCard />
                <ResetCard />
              </div>
            </div>
            <Link href="/campaigns" className="btn btn-ink" style={{ marginTop: 32 }}>
              See all campaigns →
            </Link>
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
