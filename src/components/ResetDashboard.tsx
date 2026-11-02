import type { ReactNode } from 'react';
import Link from 'next/link';
import { RoutineCalendar } from '@/components/RoutineCalendar';
import { ChangeForm, DayLogForm, ReviewForm, StartResetForm, type ResetActions } from '@/components/reset';
import { ACTIVE_GUIDE_MIN, ROUTINE_FIELDS, SLEEP_GUIDE } from '@/lib/content';
import { addDays } from '@/lib/dates';
import {
  auditExpired,
  calendarRows,
  compareWeeks,
  contrastSentence,
  dayLabel,
  hours,
  summarizeAudit,
  trialEnd,
  trialStartOptions,
  type ResetData,
  type ResetStep,
  type ResetView,
  type WeekComparison,
} from '@/lib/routine';

const STEPS: { id: ResetStep[]; n: string; label: string }[] = [
  { id: ['audit'], n: '01', label: 'Audit' },
  { id: ['plan'], n: '02', label: 'Change' },
  { id: ['trial'], n: '03', label: 'Trial' },
  { id: ['review', 'done'], n: '04', label: 'Review' },
];
const ORDER: ResetStep[] = ['start', 'audit', 'plan', 'trial', 'review', 'done'];
const DECISION_TEXT = { keep: 'You’re keeping your change.', adjust: 'You’re adjusting your change.', new: 'You’re trying a different change.' } as const;
const DECISION_TAG = { keep: 'KEPT', adjust: 'ADJUSTING', new: 'TRYING ANOTHER' } as const;

function ChangeCard({ reset, note }: { reset: ResetView; note: string }) {
  return (
    <article className="change-card" aria-label="Your change">
      <div className="change-halves">
        <div style={{ background: 'var(--sand)' }}>
          <span className="kicker">INSTEAD OF</span>
          <span className="txt">{reset.insteadOf}</span>
        </div>
        <div className="resetbg">
          <span className="kicker" style={{ color: 'var(--ink)' }}>
            I WILL
          </span>
          <span className="txt">{reset.change}</span>
        </div>
      </div>
      <div className="plan-meta" style={{ padding: '12px 22px' }}>
        {reset.stressArea ? (
          <span className="tag" style={{ background: 'var(--yellow)' }}>
            {reset.stressArea}
          </span>
        ) : null}
        <span>{note}</span>
      </div>
    </article>
  );
}

function Compare({ cmp }: { cmp: WeekComparison }) {
  return (
    <section className="streak" aria-labelledby="cmp-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <p className="kicker" style={{ color: 'var(--yellow)' }}>
          AUDIT WEEK VS TRIAL WEEK
        </p>
        <h2 id="cmp-title" className="d" style={{ marginTop: 4, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
          Before and after
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
        <span className="streak-num">
          {cmp.followed}
          <span style={{ fontSize: 40, color: 'var(--on-dark-muted)' }}>/{cmp.trialDays || 7}</span>
        </span>
        <p className="on-dark-muted" style={{ paddingBottom: 4, fontSize: 15 }}>
          days you followed your change{cmp.partly ? ` (${cmp.partly} partly)` : ''}
        </p>
      </div>
      <table className="cmp">
        <thead>
          <tr>
            <th scope="col">DAILY AVERAGE</th>
            <th scope="col">AUDIT</th>
            <th scope="col">TRIAL</th>
          </tr>
        </thead>
        <tbody>
          {cmp.rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td style={{ color: 'var(--on-dark-muted)' }}>{r.audit}</td>
              <td style={{ fontWeight: 600 }}>{r.trial}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** The My reset page below the site header, for an account (server actions) or a reset saved on this device (`guest`). */
export function ResetDashboard({
  data: r,
  who,
  day,
  saved,
  guest = false,
  actions,
  notice,
  reminders,
  after,
}: {
  data: ResetData;
  who: string;
  day?: string;
  saved?: string;
  guest?: boolean;
  actions?: ResetActions;
  notice?: ReactNode;
  /** The daily-reminder panel, shown while a reset is in progress. */
  reminders: ReactNode;
  after?: ReactNode;
}) {
  const { current, step, today, byDay } = r;
  const logged = new Set(byDay.keys());
  const expired = current ? auditExpired(current, logged, today) : false;

  // Which day's form to show: the one picked on the calendar, else the first open day of the active week.
  const firstOpen = r.editable.find((d) => !logged.has(d));
  const picked = day && r.editable.includes(day) ? day : null;
  const selected = picked ?? (step === 'audit' || step === 'trial' ? (firstOpen ?? (r.editable.includes(today) ? today : null)) : null);
  const selectedDay = selected ? byDay.get(selected) : undefined;

  const startOptions = [0, 1, 2, 3, 4, 5, 6].map((n) => {
    const d = addDays(today, -n);
    return { value: d, label: n === 0 ? `Today · ${dayLabel(d)}` : n === 1 ? `Yesterday · ${dayLabel(d)}` : dayLabel(d) };
  });
  const showStart = step === 'start' || step === 'done' || expired;
  const at = ORDER.indexOf(step);
  const summary = step === 'plan' ? summarizeAudit(r.auditRows) : null;
  const cmp = step === 'review' || step === 'done' ? compareWeeks(r.auditRows, r.trialRows) : null;
  const trialNotStarted = current?.trialStart ? current.trialStart > today : false;
  const followedSoFar = r.trialRows.filter((d) => d.followed === 'yes').length;

  return (
    <>
      <div className="resetbg">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px 32px' }}>
          <div>
            <p className="m" style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {current ? `Reset ${r.history.length + (step === 'done' ? 0 : 1)} · started ${dayLabel(current.auditStart)}${guest ? ' · on this device' : ''}` : who}
            </p>
            <h1 className="d" style={{ marginTop: 8, fontWeight: 900, fontSize: 'clamp(56px, 7vw, 88px)', lineHeight: 0.9 }}>
              My reset
            </h1>
          </div>
          {current && !expired ? (
            <ol className="reset-steps" aria-label="Reset steps">
              {STEPS.map((s) => {
                const cur = s.id.includes(step);
                const passed = !cur && (at > ORDER.indexOf(s.id[0]) || step === 'done');
                return (
                  <li key={s.n} aria-current={cur ? 'step' : undefined} className={passed ? 'done' : undefined}>
                    <span className="m">{passed ? 'DONE' : s.n}</span>
                    {s.label}
                    {passed ? <span className="sr-only"> (done)</span> : null}
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 72 }}>
        {notice}
        <div className="dash">
          <div className="dash-main">
            {step === 'done' && current?.decision ? (
              <section className="streak" role="status" aria-labelledby="done-title" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p className="kicker" style={{ color: 'var(--yellow)' }}>
                  RESET COMPLETE
                </p>
                <h2 id="done-title" className="d" style={{ fontWeight: 800, fontSize: 48, lineHeight: 1 }}>
                  {DECISION_TEXT[current.decision]}
                </h2>
                <p className="on-dark-muted" style={{ fontSize: 16, maxWidth: '40rem' }}>
                  Your stress averaged {cmp?.stressAudit} in your audit week and {cmp?.stressTrial} in your trial week. You followed your change on {cmp?.followed} of{' '}
                  {cmp?.trialDays} logged days. Start another reset to keep building on it, or work on a different part of your week.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  <a href="#start-title" className="btn btn-yellow">
                    Start another reset
                  </a>
                  <Link href="/plans#new-plan" className="btn btn-dark-outline">
                    Turn it into an if/then plan
                  </Link>
                </div>
              </section>
            ) : null}

            {expired ? (
              <div className="panel" role="status">
                <h2 style={{ fontSize: 20 }}>Your audit week ended with fewer than 3 days logged</h2>
                <p style={{ marginTop: 4, color: 'var(--body)' }}>That&apos;s fine: weeks get busy. Start a fresh audit below.{guest ? ' A daily email reminder helps: save your reset to an account to get one.' : ' Setting the daily email on helps.'}</p>
              </div>
            ) : null}

            {current && !expired ? (
              <RoutineCalendar
                rows={calendarRows(current, byDay, today, selected)}
                hint={step === 'audit' || step === 'trial' ? 'Pick a day to log or edit it' : 'Each bar is one day, 24 hours tall'}
              />
            ) : null}

            {step === 'audit' && current && !expired ? (
              <section aria-labelledby="prog-title" className="tile" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '16px 32px', padding: 24 }}>
                <p className="d" aria-hidden="true" style={{ fontWeight: 900, fontSize: 88, lineHeight: 0.8 }}>
                  {r.auditRows.length}
                  <span style={{ fontSize: 40, color: 'var(--muted)' }}>/7</span>
                </p>
                <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                  <h2 id="prog-title" style={{ fontSize: 20 }}>
                    {r.auditRows.length} of 7 audit days logged
                  </h2>
                  <p style={{ marginTop: 4, color: 'var(--body)', fontSize: 15 }}>
                    Log honestly, not ideally: this week is for noticing. Choosing your change opens on {dayLabel(addDays(current.auditStart, 7))}, or sooner once all 7
                    days are in. Missed a day? Fill it in from the calendar.
                  </p>
                </div>
              </section>
            ) : null}

            {step === 'plan' && current ? (
              <ChangeForm
                action={actions?.saveChange}
                startOptions={trialStartOptions(current, today).map((d) => ({
                  value: d,
                  label: d === today ? `Today, ${dayLabel(d)}` : d === addDays(today, 1) ? `Tomorrow, ${dayLabel(d)}` : dayLabel(d),
                }))}
              />
            ) : null}

            {(step === 'trial' || step === 'review') && current ? (
              <ChangeCard
                reset={current}
                note={
                  trialNotStarted
                    ? `Your trial week starts ${dayLabel(current.trialStart!)}`
                    : step === 'trial'
                      ? `Followed ${followedSoFar} of ${r.trialRows.length} days so far · trial ends ${dayLabel(trialEnd(current)!)}`
                      : `Trial week · ${dayLabel(current.trialStart!)} – ${dayLabel(trialEnd(current)!)}`
                }
              />
            ) : null}

            {step === 'review' ? <ReviewForm action={actions?.saveReview} /> : null}

            {showStart ? <StartResetForm options={startOptions} again={r.history.length > 0 || expired} action={actions?.start} /> : null}

            {step === 'start' && !r.history.length ? (
              <p style={{ fontSize: 15, color: 'var(--muted)' }}>
                New here? <Link href="/reset">See how a reset works</Link>.
              </p>
            ) : null}

            {r.history.length ? (
              <section aria-labelledby="hist-title" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <h2 id="hist-title" style={{ fontSize: 20 }}>
                  Past resets
                </h2>
                {r.history.map((h, i) => (
                  <div key={h.id} className="panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600 }}>
                        Reset {r.history.length - i}
                        {h.stressArea ? ` · ${h.stressArea}` : ''}
                      </p>
                      <p style={{ marginTop: 2, fontSize: 14, color: 'var(--muted)' }}>
                        Instead of {h.insteadOf}, I will {h.change}.
                      </p>
                    </div>
                    <p className="m" style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600 }}>
                      {dayLabel(h.auditStart).toUpperCase()}
                      {h.decision ? ` · ${DECISION_TAG[h.decision]}` : ''}
                    </p>
                  </div>
                ))}
              </section>
            ) : null}
          </div>

          <aside className="dash-side">
            {selected && current && (current.status === 'audit' || current.status === 'trial') ? (
              <DayLogForm
                key={selected}
                day={selected}
                title={dayLabel(selected)}
                kicker={`${current.status === 'trial' ? 'TRIAL' : 'AUDIT'} · DAY ${r.editable.indexOf(selected) + 1} OF 7`}
                trial={current.status === 'trial'}
                initial={selectedDay ?? null}
                saved={saved && byDay.has(saved) ? dayLabel(saved) : null}
                action={actions?.logDay}
              />
            ) : null}

            {!selected && saved && byDay.has(saved) ? (
              <p role="status" className="panel" style={{ color: 'var(--green-text)', fontWeight: 600 }}>
                Saved {dayLabel(saved)}. {step === 'plan' ? 'Your audit week is complete: choose your change.' : step === 'review' ? 'Your trial week is complete: time to review.' : ''}
              </p>
            ) : null}

            {step === 'trial' && trialNotStarted ? (
              <div className="panel">
                <h2 style={{ fontSize: 20 }}>Your trial week starts {dayLabel(current!.trialStart!)}</h2>
                <p style={{ marginTop: 4, color: 'var(--body)', fontSize: 15 }}>Come back then to log your first trial day.{guest ? '' : ' We’ll email you that morning at 8:00 am.'}</p>
              </div>
            ) : null}

            {summary ? (
              <section className="streak" aria-labelledby="sum-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p className="kicker" style={{ color: 'var(--yellow)' }}>
                    AUDIT WEEK · {summary.days} OF 7 DAYS
                  </p>
                  <h2 id="sum-title" className="d" style={{ marginTop: 4, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                    What your week shows
                  </h2>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {ROUTINE_FIELDS.map((f) => {
                    const value =
                      f.key === 'active' ? `${summary.activeMinutes} min a week` : f.key === 'sleep' ? `${hours(summary.avg.sleep)} h a night` : `${hours(summary.avg[f.key])} h a day`;
                    const [note, warn] =
                      f.key === 'sleep'
                        ? [summary.sleepLow ? `Below the ${SLEEP_GUIDE.min}–${SLEEP_GUIDE.max} h most people need.` : `Within ${SLEEP_GUIDE.min}–${SLEEP_GUIDE.max} h.`, summary.sleepLow]
                        : f.key === 'active'
                          ? [summary.activeLow ? `Under the ${ACTIVE_GUIDE_MIN} min a week guide.` : `Meets the ${ACTIVE_GUIDE_MIN} min a week guide.`, summary.activeLow]
                          : f.key === 'study'
                            ? [`Ranged from ${hours(summary.studyRange[0])} to ${hours(summary.studyRange[1])} h.`, false]
                            : f.key === 'screen'
                              ? ['Not counting study.', false]
                              : ['', false];
                    return (
                      <li key={f.key} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '4px 12px', padding: '10px 0', borderTop: '1px solid #333' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                          <span className="swatch" style={{ background: f.color, borderColor: 'var(--grey)' }} aria-hidden="true" />
                          {f.label}
                        </span>
                        <span className="m" style={{ fontSize: 15, fontWeight: 600 }}>
                          {value}
                        </span>
                        {note ? <span style={{ flex: '1 0 100%', fontSize: 13, color: warn ? 'var(--orange)' : 'var(--on-dark-muted)' }}>{note}</span> : null}
                      </li>
                    );
                  })}
                </ul>
                <div style={{ background: 'var(--yellow)', color: 'var(--ink)', borderRadius: 4, padding: '16px 18px' }}>
                  <p className="kicker" style={{ color: 'var(--ink)' }}>
                    YOUR STRESSFUL DAYS
                  </p>
                  <p style={{ marginTop: 6, fontSize: 16, lineHeight: 1.45 }}>
                    {contrastSentence(summary) ?? 'Your stress was fairly even this week. Look at the calendar for the day that felt hardest, and what came before it.'}
                  </p>
                </div>
              </section>
            ) : null}

            {cmp ? <Compare cmp={cmp} /> : null}

            {current && (current.status === 'audit' || current.status === 'trial') && !expired ? reminders : null}
          </aside>
        </div>

        {current || r.history.length ? (
          <section aria-labelledby="badges-title" style={{ marginTop: 56 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px 24px', borderBottom: '2px solid var(--ink)', paddingBottom: 12 }}>
              <h2 id="badges-title" className="d" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1 }}>
                Reset badges
              </h2>
              <p className="m" style={{ fontSize: 14, color: 'var(--muted)' }}>
                {r.badges.filter((b) => b.earned).length} of {r.badges.length} earned
              </p>
            </div>
            <ul className="badges">
              {r.badges.map((b) => (
                <li key={b.title}>
                  <span className={`medal ${b.earned ? 'earned' : 'locked'}`} aria-hidden="true" style={b.earned ? { background: 'var(--yellow)' } : undefined}>
                    {b.mark}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600 }}>
                      {b.title}
                      <span className="sr-only">{b.earned ? ' (earned)' : ' (not earned yet)'}</span>
                    </p>
                    <p style={{ marginTop: 2, fontSize: 14, color: 'var(--muted)' }}>{b.desc}</p>
                    <p className="m" style={{ marginTop: 6, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', color: 'var(--green-text)' }}>
                      {b.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {after}
      </main>
    </>
  );
}
