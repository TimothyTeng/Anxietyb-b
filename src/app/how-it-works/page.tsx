import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpBand, SiteHeader } from '@/components/chrome';
import { EVIDENCE, PAIRS } from '@/lib/content';

export const metadata: Metadata = { title: 'IF/THEN: how it works' };

const STEPS = [
  { n: '1', color: 'var(--green-text)', title: 'What do you want?', body: <>Name one thing you&apos;d choose if you were calm and thinking clearly.</>, eg: <>&quot;To be asleep by midnight before a test.&quot;</> },
  {
    n: '2',
    color: 'var(--orange-text)',
    title: 'What gets in the way?',
    body: (
      <>
        Find the exact moment anxiety usually wins. Be specific: when, where, what you feel. That moment becomes your <span className="ifk">IF</span>.
      </>
    ),
    eg: <>&quot;11pm in bed, scrolling so I don&apos;t think about tomorrow.&quot;</>,
  },
  {
    n: '3',
    color: 'var(--ink)',
    title: 'What will you do instead?',
    body: (
      <>
        Pick one small step that calms rather than pushes. That&apos;s your <span className="thenk">THEN</span>. Put the two together.
      </>
    ),
    eg: (
      <>
        <span className="ifk">IF</span> it&apos;s 11pm and I&apos;m still scrolling, <span className="thenk">THEN</span> my phone sleeps outside my room.
      </>
    ),
  },
];

const CHECKLIST = [
  { c: 'var(--orange)', t: 'The "if" is a specific moment', d: 'A time, place or body feeling, not "when I\'m stressed".' },
  { c: 'var(--mint)', t: 'The "then" is small and calming', d: 'Under 5 minutes. "Try harder" plans can backfire.' },
  { c: 'var(--yellow)', t: 'You wrote it while calm', d: 'In your own words, ahead of the moment.' },
  { c: 'var(--pink)', t: 'You know where to get help', d: 'A plan is self-help, not treatment.' },
];

const SOURCES = [
  <>Bell, Raiffa &amp; Tversky (1988). <i>Decision making: Descriptive, normative, and prescriptive interactions.</i></>,
  <>Eysenck et al. (2007). Anxiety and cognitive performance. <i>Emotion, 7</i>(2).</>,
  <>Gollwitzer (1999). Implementation intentions. <i>American Psychologist, 54</i>(7).</>,
  <>Gollwitzer &amp; Sheeran (2006). <i>Advances in Experimental Social Psychology, 38.</i></>,
  <>Kahneman (2011). <i>Thinking, fast and slow.</i></>,
  <>Nanyang Technological University (2018). <i>Only 20 per cent of students get enough sleep.</i></>,
  <>Parks-Stamm et al. (2010). <i>Learning and Individual Differences, 20.</i></>,
  <>Schweiger Gallo et al. (2009). <i>Journal of Personality and Social Psychology, 96</i>(1).</>,
  <>Wang, Wang &amp; Gai (2021). <i>Frontiers in Psychology, 12</i>, 565202.</>,
];

function Cross() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#5E5A52" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="#2F6B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const chip = { border: '1.5px solid var(--ink)', color: 'var(--ink)', padding: '10px 16px', borderRadius: 99, textDecoration: 'none', fontSize: 15, fontWeight: 600 } as const;

export default function HowItWorks() {
  return (
    <>
      <SiteHeader current="how" />
      <main>
        <section className="section" style={{ padding: '72px 0 56px' }}>
          <div className="wrap">
            <p className="eyebrow">IF / THEN · How it works</p>
            <h1 className="d" style={{ marginTop: 14, fontWeight: 900, fontSize: 'clamp(64px, 9vw, 128px)', lineHeight: 0.88 }}>
              <span style={{ display: 'block', color: 'var(--green-text)' }}>Decide calm.</span>
              <span style={{ display: 'block', color: 'var(--orange-text)' }}>Act automatic.</span>
            </h1>
            <p className="col" style={{ marginTop: 24, fontSize: 22, lineHeight: 1.45 }}>
              An if/then plan links the moment anxiety usually wins to one small action you choose in advance. Here&apos;s how to write one in about a minute, and why it
              works.
            </p>
            <nav aria-label="On this page" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
              <a href="#write" style={chip}>Write one</a>
              <a href="#stronger" style={chip}>Make it stronger</a>
              <a href="#why" style={chip}>Why it works</a>
              <a href="#evidence" style={chip}>The evidence</a>
            </nav>
          </div>
        </section>

        <section className="section" style={{ padding: '72px 0' }} aria-labelledby="anatomy-title">
          <div className="wrap">
            <p className="eyebrow">01 · The shape of a plan</p>
            <h2 id="anatomy-title" className="h2">Two halves, one sentence</h2>
            <div className="anatomy">
              <div className="hotbg">
                <p className="d" style={{ fontWeight: 900, fontSize: 96, lineHeight: 0.8 }}>IF</p>
                <p className="d" style={{ marginTop: 6, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>[a specific moment]</p>
                <p style={{ marginTop: 6, maxWidth: '28rem' }}>A time, a place or a body feeling you&apos;ll recognise the instant it happens. This is the cue your fast brain reacts to.</p>
              </div>
              <div className="coolbg">
                <p className="d" style={{ fontWeight: 900, fontSize: 96, lineHeight: 0.8 }}>THEN</p>
                <p className="d" style={{ marginTop: 6, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>[one small, calming step]</p>
                <p style={{ marginTop: 6, maxWidth: '28rem' }}>Something you can do in under 5 minutes, without needing willpower. It should calm you, not push you harder.</p>
              </div>
            </div>
            <p className="m" style={{ marginTop: 24 }}>
              <span className="ifk">IF</span> it&apos;s 11pm and I&apos;m still scrolling, <span className="thenk">THEN</span> my phone sleeps outside my room.
            </p>
          </div>
        </section>

        <section id="write" className="section" style={{ padding: '72px 0' }} aria-labelledby="write-title">
          <div className="wrap">
            <p className="eyebrow">02 · Write yours</p>
            <h2 id="write-title" className="h2">Three questions, about a minute</h2>
            <p className="lede">Do this when you feel calm, not in the anxious moment itself. Planning around the obstacle first is what makes the plan stick.</p>
            <ol className="steps">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="num" style={{ color: s.color }}>{s.n}</span>
                  <h3 style={{ fontSize: 22, lineHeight: 1.25 }}>{s.title}</h3>
                  <p style={{ color: 'var(--body)' }}>{s.body}</p>
                  <p className="eg">{s.eg}</p>
                </li>
              ))}
            </ol>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 32px', marginTop: 32, background: 'var(--sand)', borderRadius: 6, padding: '24px 28px' }}>
              <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                <p style={{ fontSize: 19, fontWeight: 600 }}>Lock it in</p>
                <p style={{ marginTop: 4, color: 'var(--body)' }}>Save your plan to your account, choose how often we email it back to you, and check in each week to build a streak.</p>
              </div>
              <Link href="/plans#new-plan" className="btn btn-orange">Save my plan →</Link>
            </div>
          </div>
        </section>

        <section id="stronger" className="section" style={{ padding: '72px 0' }} aria-labelledby="stronger-title">
          <div className="wrap">
            <p className="eyebrow">03 · Make it stronger</p>
            <h2 id="stronger-title" className="h2">Vague plans don&apos;t fire</h2>
            <p className="lede">Your fast brain responds to cues, not intentions. Compare these.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 36 }}>
              {PAIRS.map((p) => (
                <div key={p.weak} className="pair">
                  <div>
                    <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Cross />WEAK
                    </p>
                    <p className="m" style={{ fontSize: 16, color: 'var(--body)', textDecoration: 'line-through', textDecorationColor: 'var(--line)' }}>{p.weak}</p>
                    <p style={{ fontSize: 15, color: 'var(--muted)' }}>{p.why}</p>
                  </div>
                  <div>
                    <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--green-text)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Check />STRONG
                    </p>
                    <p className="m" style={{ fontSize: 16, fontWeight: 500 }}>
                      <span className="ifk">IF</span> {p.ifText}, <span className="thenk">THEN</span> {p.thenText}.
                    </p>
                    <p style={{ fontSize: 15, color: 'var(--muted)' }}>{p.good}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 style={{ marginTop: 48, fontSize: 22 }}>Your checklist</h3>
            <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {CHECKLIST.map((c) => (
                <li key={c.t} style={{ borderTop: `4px solid ${c.c}`, paddingTop: 14 }}>
                  <strong style={{ display: 'block' }}>{c.t}</strong>
                  <span style={{ color: 'var(--body)', fontSize: 15 }}>{c.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="why" className="section" style={{ padding: '72px 0' }} aria-labelledby="why-title">
          <div className="wrap">
            <p className="eyebrow">04 · Why it works</p>
            <h2 id="why-title" className="h2">Anxiety hands the decision to your fast brain</h2>
            <p className="lede">Psychologist Daniel Kahneman describes two modes of thinking. Anxiety strengthens one and weakens the other.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 20, marginTop: 32 }}>
              <div className="sys" style={{ background: 'var(--pink-soft)' }}>
                <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--orange-text)' }}>FAST BRAIN</p>
                <h3 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>System 1</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
                  <li>Fast, automatic and effortless</li>
                  <li>Driven by feelings, cues and habits</li>
                  <li>Chooses what feels better right now</li>
                </ul>
                <p style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid rgba(168,74,20,.25)', fontSize: 16 }}>
                  <strong>Under anxiety:</strong> takes over. It focuses on threat and pushes for quick relief, which often means avoidance.
                </p>
              </div>
              <div className="sys" style={{ background: 'var(--mint-soft)' }}>
                <p className="m" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--green-text)' }}>SLOW BRAIN</p>
                <h3 className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>System 2</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
                  <li>Slow, deliberate and effortful</li>
                  <li>Weighs options and long-term consequences</li>
                  <li>Can override System 1, but tires easily</li>
                </ul>
                <p style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid rgba(47,107,74,.3)', fontSize: 16 }}>
                  <strong>Under anxiety:</strong> weakened. Anxiety uses up the attention and working memory careful thinking needs.
                </p>
              </div>
            </div>
            <p className="col" style={{ marginTop: 28, fontSize: 19, lineHeight: 1.5 }}>
              Most campaigns give students facts, which speaks to System 2. But the decision is lost in a System 1 moment. An if/then plan uses System 2, while calm, to
              programme what System 1 does later.
            </p>

            <h3 style={{ marginTop: 56, fontSize: 22 }}>What we should do versus what we actually do</h3>
            <p className="col" style={{ marginTop: 8, color: 'var(--body)' }}>
              Decision science looks at a choice through three lenses. The gap between the first two, knowing the better option and choosing the other, is called{' '}
              <em>akrasia</em>.
            </p>
            <div className="table-box">
              <table>
                <thead>
                  <tr>
                    <th scope="col">LENS</th>
                    <th scope="col">THE QUESTION</th>
                    <th scope="col">A STUDENT AT 11PM, THE NIGHT BEFORE A TEST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" style={{ width: 140 }}>Normative</th>
                    <td style={{ color: 'var(--muted)', width: 240 }}>How should a rational person decide?</td>
                    <td>Weigh each option by its long-term value. Sleep wins: better mood, focus and lower anxiety tomorrow.</td>
                  </tr>
                  <tr>
                    <th scope="row">Descriptive</th>
                    <td style={{ color: 'var(--muted)' }}>How do people actually decide?</td>
                    <td>System 1 takes over and scrolling wins, because the relief is instant. At 3pm she preferred to sleep at 11pm; at 11pm the preference flips (present bias).</td>
                  </tr>
                  <tr>
                    <th scope="row" style={{ color: 'var(--green-text)' }}>Prescriptive</th>
                    <td style={{ color: 'var(--muted)' }}>What tool moves real people closer to the normative choice?</td>
                    <td style={{ fontWeight: 500 }}>An if/then plan written at 3pm locks in her calm preference and carries it out at 11pm.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: 56, fontSize: 22 }}>How the plan closes the gap</h3>
            <ol className="flow">
              <li style={{ borderTopColor: 'var(--mint)' }}>
                <p className="m" style={{ fontSize: 12, letterSpacing: '.1em', color: 'var(--muted)' }}>CALM MOMENT · SYSTEM 2</p>
                <p className="d" style={{ fontWeight: 800, fontSize: 32, lineHeight: 1 }}>Decide calm</p>
                <p style={{ fontSize: 16 }}>What do I want, what usually gets in the way, and which step serves me long term?</p>
              </li>
              <li style={{ borderTopColor: 'var(--yellow)' }}>
                <p className="m" style={{ fontSize: 12, letterSpacing: '.1em', color: 'var(--muted)' }}>WRITE IT DOWN</p>
                <p className="d" style={{ fontWeight: 800, fontSize: 32, lineHeight: 1 }}>Encode the plan</p>
                <p style={{ fontSize: 16 }}>
                  Turn the decision into a cue and an action: <span className="m" style={{ fontSize: 15, background: 'var(--sand)', padding: '1px 6px', borderRadius: 3 }}>IF [moment] THEN [small step]</span>.
                </p>
              </li>
              <li style={{ borderTopColor: 'var(--orange)' }}>
                <p className="m" style={{ fontSize: 12, letterSpacing: '.1em', color: 'var(--muted)' }}>ANXIOUS MOMENT · SYSTEM 1</p>
                <p className="d" style={{ fontWeight: 800, fontSize: 32, lineHeight: 1 }}>Act automatic</p>
                <p style={{ fontSize: 16 }}>When the cue appears, the action follows with little thought or willpower. Control passes to the situation.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="evidence" className="section" style={{ padding: '72px 0' }} aria-labelledby="evidence-title">
          <div className="wrap">
            <p className="eyebrow">05 · The evidence</p>
            <h2 id="evidence-title" className="h2">Small plans, real effects</h2>
            <ul className="evidence">
              {EVIDENCE.map((e) => (
                <li key={e.fig}>
                  <span className="m" style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 18, color: 'var(--green-text)' }}>{e.fig}</span>
                  <span style={{ flex: '1 1 360px', minWidth: 0 }}>
                    {e.text} <span style={{ color: 'var(--muted)', fontSize: 15 }}>({e.src})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="coolbg" style={{ padding: '64px 0' }} aria-labelledby="cta-title">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px 48px' }}>
            <div style={{ flex: '1 1 520px', minWidth: 0 }}>
              <h2 id="cta-title" className="d" style={{ fontWeight: 800, fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.95 }}>
                Write your first plan now, while you&apos;re calm.
              </h2>
              <p style={{ marginTop: 14, fontSize: 18 }}>Save it, get reminded, and earn your first badge.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/plans#new-plan" className="btn btn-orange">Write my plan</Link>
              <Link href="/#join" className="btn btn-outline">Just join the email list</Link>
            </div>
          </div>
        </section>
      </main>
      <HelpBand />
      <footer style={{ padding: '40px 0 56px' }}>
        <div className="wrap">
          <h2 style={{ fontSize: 16 }}>Sources</h2>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '6px 32px', fontSize: 14, color: 'var(--muted)' }}>
            {SOURCES.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}
