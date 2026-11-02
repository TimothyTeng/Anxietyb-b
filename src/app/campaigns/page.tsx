import type { Metadata } from 'next';
import { HelpBand, SiteFooter, SiteHeader } from '@/components/chrome';
import { AwarenessCard, IfThenCard, ResetCard } from '@/components/campaigns';
import { ANXIETY_STAT, AWARENESS_GROUPS, CAMPAIGN_INTRO } from '@/lib/content';

export const metadata: Metadata = {
  title: 'All campaigns',
  description: 'Every Anxiety b&b campaign: engagement campaigns to act on anxiety, and awareness campaigns built into the commute.',
};

export default function CampaignsPage() {
  return (
    <>
      <SiteHeader current="campaigns" />
      <main>
        <section className="section" style={{ padding: '64px 0 56px' }} aria-labelledby="all-title">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 64px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 560px', minWidth: 0 }}>
              <p className="eyebrow">Anxiety b&amp;b · All campaigns</p>
              <h1 id="all-title" className="d" style={{ marginTop: 14, fontWeight: 900, fontSize: 'clamp(56px, 8vw, 112px)', lineHeight: 0.9 }}>
                Notice it. Act on it.
              </h1>
              <p className="col" style={{ marginTop: 20, fontSize: 20, lineHeight: 1.5 }}>
                {CAMPAIGN_INTRO}
              </p>
              <nav aria-label="On this page" className="chips">
                <a href="#engagement">Engagement campaigns</a>
                {AWARENESS_GROUPS.map((g) => (
                  <a key={g.id} href={`#${g.id}`}>
                    {g.concept}
                  </a>
                ))}
              </nav>
            </div>
            <aside className="stat-card" aria-label="Why it matters">
              <p className="d" style={{ fontWeight: 900, fontSize: 88, lineHeight: 0.85 }}>
                {ANXIETY_STAT.fig}
              </p>
              <p style={{ fontSize: 17 }}>{ANXIETY_STAT.text}</p>
              <p className="m" style={{ fontSize: 12, color: 'var(--muted)' }}>
                {ANXIETY_STAT.src}
              </p>
            </aside>
          </div>
        </section>

        <section id="engagement" className="section" aria-labelledby="eng-title">
          <div className="wrap">
            <div className="cat-head">
              <h2 id="eng-title" className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                Engagement
              </h2>
              <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                Act on it · on this site
              </span>
            </div>
            <p className="lede">Tools you use over days and weeks: plan for the moments anxiety usually wins, and reset the routine that feeds it.</p>
            <div className="grid-cards" style={{ marginTop: 32 }}>
              <IfThenCard tag="ENGAGEMENT" />
              <ResetCard />
            </div>
          </div>
        </section>

        {AWARENESS_GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="section" aria-labelledby={`${g.id}-heading`}>
            <div className="wrap">
              <div className="cat-head">
                <h2 id={`${g.id}-heading`} className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                  Awareness
                </h2>
                <span className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Notice it · out in the city
                </span>
              </div>
              <div className="concept">
                <p className="kicker" style={{ color: 'var(--green-text)' }}>
                  {g.part.toUpperCase()} · THE IDEA BEHIND IT
                </p>
                <p className="d" style={{ fontWeight: 800, fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1 }}>
                  {g.concept}
                </p>
                <p style={{ color: 'var(--body)', maxWidth: '48rem' }}>{g.explain}</p>
              </div>
              <div className="grid-cards">
                {g.ideas.map((idea) => (
                  <AwarenessCard key={idea.id} idea={idea} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <HelpBand />
      <SiteFooter />
    </>
  );
}
