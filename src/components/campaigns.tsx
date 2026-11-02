import Image from 'next/image';
import Link from 'next/link';
import { ROUTINE_FIELDS, type AwarenessIdea } from '@/lib/content';

// Campaign cards shared by the home page and All campaigns.

const cardShadow = '0 14px 30px -16px rgba(70,50,20,.5)';

export function IfThenCard({ tag = 'FEATURED' }: { tag?: string }) {
  return (
    <article style={{ borderRadius: 6, overflow: 'hidden', boxShadow: cardShadow }}>
      <div className="hotbg" style={{ padding: '20px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <p className="d" style={{ fontWeight: 900, fontSize: 64, lineHeight: 0.8 }}>
          IF<span style={{ opacity: 0.45 }}>/</span>THEN
        </p>
        <span className="m" style={{ fontSize: 12, fontWeight: 600, background: 'var(--pink)', padding: '4px 10px', borderRadius: 99 }}>
          {tag}
        </span>
      </div>
      <div className="zig-sm" aria-hidden="true" />
      <div className="coolbg" style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>Decide calm. Act automatic.</p>
        <p style={{ fontSize: 15 }}>Write a short plan that links the moment anxiety usually wins to one small action. Save it, get reminded, and build a streak.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
          <Link href="/how-it-works" className="btn btn-orange" style={{ minHeight: 44, fontSize: 15 }}>
            How it works
          </Link>
          <Link href="/plans" className="btn btn-outline" style={{ minHeight: 44, fontSize: 15 }}>
            Write a plan
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ResetCard() {
  return (
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
  );
}

/** A small awareness card for the home page, linking to its full write-up on All campaigns. */
export function AwarenessTile({ idea }: { idea: AwarenessIdea }) {
  return (
    <Link href={`/campaigns#${idea.id}`} className="aw-tile">
      <Image src={idea.image} alt="" width={160} height={110} sizes="120px" />
      <span style={{ minWidth: 0 }}>
        <span className="m" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--orange-text)' }}>
          {idea.n}
        </span>
        <span style={{ display: 'block', fontSize: 18, fontWeight: 600, lineHeight: 1.25 }}>{idea.title}</span>
        <span style={{ display: 'block', marginTop: 2, fontSize: 14, color: 'var(--body)' }}>{idea.tagline}</span>
      </span>
    </Link>
  );
}

export function AwarenessCard({ idea }: { idea: AwarenessIdea }) {
  return (
    <article id={idea.id} className="aw-card" aria-labelledby={`${idea.id}-title`}>
      <Image src={idea.image} alt={idea.alt} width={800} height={500} sizes="(max-width: 760px) 100vw, 560px" style={{ width: '100%', height: 'auto', aspectRatio: '16 / 10', objectFit: 'cover' }} />
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p className="m" style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange-text)' }}>
            {idea.n}
          </p>
          <h3 id={`${idea.id}-title`} className="d" style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
            {idea.title}
          </h3>
          <p style={{ marginTop: 6, fontSize: 17, fontWeight: 600 }}>{idea.tagline}</p>
        </div>
        <ul className="aw-points">
          {idea.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p style={{ color: 'var(--body)' }}>{idea.body}</p>
        {idea.extra ? <p style={{ fontSize: 15, background: 'var(--sand)', borderRadius: 4, padding: '12px 14px' }}>{idea.extra}</p> : null}
      </div>
    </article>
  );
}
