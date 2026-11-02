import type { Poster as PosterData } from '@/lib/content';

export function Poster({ poster }: { poster: PosterData }) {
  return (
    <div className="poster" role="img" aria-label={`${poster.label} poster: IF ${poster.ifText} THEN ${poster.thenText}`}>
      <div className="poster-top hotbg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span className="d" style={{ fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
            IF<span style={{ opacity: 0.45 }}>/</span>THEN
          </span>
          <span className="m" style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.45)', padding: '3px 9px', borderRadius: 99 }}>
            {poster.status}
          </span>
        </div>
        <span className="d" style={{ marginTop: 'auto', fontWeight: 900, fontSize: 76, lineHeight: 0.78 }}>
          IF
        </span>
        <span className="d" style={{ marginTop: 8, fontWeight: 800, fontSize: 27, lineHeight: 1 }}>
          {poster.ifText}
        </span>
      </div>
      <div className="zig-sm" aria-hidden="true" />
      <div className="poster-bottom coolbg">
        <span className="d" style={{ fontWeight: 900, fontSize: 58, lineHeight: 0.8 }}>
          THEN
        </span>
        <span className="d" style={{ fontWeight: 800, fontSize: 27, lineHeight: 1 }}>
          {poster.thenText}
        </span>
        <span className="m" style={{ marginTop: 'auto', fontSize: 11, borderTop: '1px solid rgba(17,17,17,.2)', paddingTop: 8 }}>
          Anxious most days? mindline 1771
        </span>
      </div>
    </div>
  );
}
