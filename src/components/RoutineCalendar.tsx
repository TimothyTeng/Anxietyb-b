import Link from 'next/link';
import { ROUTINE_FIELDS } from '@/lib/content';
import { followText, type CalendarCell, type CalendarRow } from '@/lib/routine';

const COLOR: Record<string, string> = { ...Object.fromEntries(ROUTINE_FIELDS.map((f) => [f.key, f.color])), other: 'var(--sand)' };

export function DayBar({ cell }: { cell: CalendarCell }) {
  return (
    <span className="daybar" aria-hidden="true">
      {cell.segments.map((s) => (
        <span key={s.key} style={{ flex: `${s.h} 1 0px`, background: COLOR[s.key] }} />
      ))}
    </span>
  );
}

function Cell({ cell }: { cell: CalendarCell }) {
  const cls = ['cal-cell', cell.future && !cell.tentative && 'future', cell.tentative && 'tentative', cell.isToday && 'today', cell.selected && 'selected'].filter(Boolean).join(' ');
  const body = (
    <>
      <span className="cal-top">
        <span className="cal-date">
          <small>{cell.weekday}</small>
          {cell.date}
        </span>
        {cell.stress ? <span className={`stress-chip s${cell.stress}`}>{cell.stress}</span> : null}
      </span>
      {cell.logged ? <DayBar cell={cell} /> : <span className="daybar-empty" aria-hidden="true">{cell.editable ? 'Log' : cell.future || cell.tentative ? '' : '—'}</span>}
      <span className="cal-foot">{cell.logged ? followText(cell.followed) || `${Math.round(cell.segments[0].h * 10) / 10}h sleep` : cell.isToday ? 'Today' : ''}</span>
    </>
  );
  return cell.editable ? (
    <Link href={`/reset/me?day=${cell.day}#log`} className={cls} aria-label={`${cell.aria}${cell.logged ? ' Edit this day.' : ' Log this day.'}`} aria-current={cell.selected ? 'date' : undefined} scroll={false}>
      {body}
    </Link>
  ) : (
    <div className={cls} role="img" aria-label={cell.aria}>
      {body}
    </div>
  );
}

export function RoutineCalendar({ rows, hint }: { rows: CalendarRow[]; hint: string }) {
  return (
    <section className="panel" aria-labelledby="cal-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px 16px' }}>
        <h2 id="cal-title" style={{ fontSize: 22 }}>
          Your two weeks
        </h2>
        <p className="m" style={{ fontSize: 13, color: 'var(--muted)' }}>
          {hint}
        </p>
      </div>
      {rows.map((row) => (
        <div key={row.phase} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '4px 12px' }}>
            <p className="kicker" style={{ color: row.phase === 'audit' ? 'var(--orange-text)' : 'var(--green-text)' }}>
              {row.title.toUpperCase()}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{row.sub}</p>
          </div>
          <ol className="cal-week" aria-label={row.title}>
            {row.cells.map((c) => (
              <li key={c.day} style={{ minWidth: 0 }}>
                <Cell cell={c} />
              </li>
            ))}
          </ol>
        </div>
      ))}
      <ul className="key" aria-label="Colour key">
        {ROUTINE_FIELDS.map((f) => (
          <li key={f.key}>
            <span className="swatch" style={{ background: f.color }} aria-hidden="true" />
            {f.label}
          </li>
        ))}
        <li>
          <span className="swatch" style={{ background: 'var(--sand)' }} aria-hidden="true" />
          Not logged
        </li>
        <li>
          <span className="stress-chip s5" aria-hidden="true">
            4
          </span>
          Stress, 1–5
        </li>
      </ul>
    </section>
  );
}
