'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { GuestReminders, GuestSave, DeviceNote } from '@/components/guest';
import type { ResetActions } from '@/components/reset';
import { ResetDashboard } from '@/components/ResetDashboard';
import { sgToday } from '@/lib/dates';
import { changeSchema, parseDay, parseReview, tidyChange } from '@/lib/forms';
import { readGuest, updateGuest, useGuest, type GuestData, type GuestReset as Reset } from '@/lib/guest';
import { computeReset, logDayError, startDayOk, trialStartOptions } from '@/lib/routine';

const isActive = (r: Reset) => r.status === 'audit' || r.status === 'trial';
const stateOf = (d: GuestData) => computeReset(d.resets, d.days, sgToday());
const patchCurrent = (id: number, patch: Partial<Reset>) => updateGuest((d) => ({ ...d, resets: d.resets.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
const stopActive = () => updateGuest((d) => ({ ...d, resets: d.resets.map((r) => (isActive(r) ? { ...r, status: 'stopped' } : r)) }));

/** My reset for students who haven't signed in: the same page and forms, saving to this device. */
export function GuestReset({ day, saved }: { day?: string; saved?: string }) {
  const guest = useGuest();
  const router = useRouter();

  const actions = useMemo<ResetActions>(
    () => ({
      async start(_prev, form) {
        const today = sgToday();
        const start = String(form.get('start') ?? today);
        if (!startDayOk(start, today)) return { status: 'error', message: 'Pick a start day in the last week.' };
        stopActive();
        updateGuest((d) => ({
          ...d,
          resets: [
            { id: d.nextId, status: 'audit', auditStart: start, stressArea: null, stressor: null, insteadOf: null, change: null, trialStart: null, obstacles: null, helped: null, wellbeingBefore: null, wellbeingAfter: null, decision: null, dailyEmails: false },
            ...d.resets,
          ],
          nextId: d.nextId + 1,
        }));
        router.push('/reset/me');
        return { status: 'ok' };
      },
      async logDay(_prev, form) {
        const parsed = parseDay(form);
        if ('error' in parsed) return { status: 'error', message: parsed.error };
        const d = parsed.data;
        const { current } = stateOf(readGuest());
        const problem = logDayError(current, d.day, d.followed, sgToday());
        if (problem || !current) return { status: 'error', message: problem ?? '' };
        const phase = current.status === 'trial' ? 'trial' : 'audit';
        const row = { resetId: current.id, day: d.day, phase, sleep: d.sleep, study: d.study, active: d.active, rest: d.rest, screen: d.screen, stress: d.stress, followed: phase === 'trial' ? (d.followed ?? null) : null, note: d.note } as const;
        updateGuest((g) => ({ ...g, days: [...g.days.filter((x) => !(x.resetId === current.id && x.day === d.day)), row] }));
        // Like the signed-in page: move on to the next open day and confirm the one just logged.
        router.push(`/reset/me?saved=${d.day}#log`);
        return { status: 'ok' };
      },
      async saveChange(_prev, form) {
        const parsed = changeSchema.safeParse(Object.fromEntries(form));
        if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
        const r = stateOf(readGuest());
        if (!r.current || r.step !== 'plan') return { status: 'error', message: 'Finish your audit week first.' };
        const c = parsed.data;
        if (!trialStartOptions(r.current, r.today).includes(c.start)) return { status: 'error', message: 'Pick when your trial week starts.' };
        patchCurrent(r.current.id, { status: 'trial', stressArea: c.stressArea, stressor: c.stressor || null, insteadOf: tidyChange(c.insteadOf), change: tidyChange(c.change), trialStart: c.start });
        return { status: 'ok' };
      },
      async saveReview(_prev, form) {
        const parsed = parseReview(form);
        if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
        const r = stateOf(readGuest());
        if (!r.current || r.step !== 'review') return { status: 'error', message: 'Your trial week isn’t finished yet.' };
        const v = parsed.data;
        patchCurrent(r.current.id, { status: 'done', obstacles: v.obstacles || null, helped: v.helped || null, wellbeingBefore: v.wellbeingBefore, wellbeingAfter: v.wellbeingAfter, decision: v.decision });
        return { status: 'ok' };
      },
    }),
    [router],
  );

  if (!guest) {
    return (
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 72 }} aria-busy="true">
        <p className="eyebrow">Loading what&apos;s saved on this device…</p>
      </main>
    );
  }

  const data = stateOf(guest);
  return (
    <ResetDashboard
      data={data}
      who="Not signed in · saved on this device"
      day={day}
      saved={saved}
      guest
      actions={actions}
      notice={<DeviceNote kind="reset" />}
      reminders={
        <>
          <GuestReminders kind="reset" />
          <button
            type="button"
            className="linkish"
            style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--muted)', textDecoration: 'underline' }}
            onClick={() => {
              if (confirm('Stop this reset? Your logged days stay on this device.')) stopActive();
            }}
          >
            Stop this reset
          </button>
        </>
      }
      after={<GuestSave kind="reset" />}
    />
  );
}
