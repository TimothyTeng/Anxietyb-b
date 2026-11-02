'use client';

import type { PlanActions } from '@/components/plans';
import { PlansDashboard } from '@/components/PlansDashboard';
import { DeviceNote, GuestReminders, GuestSave } from '@/components/guest';
import { sgToday } from '@/lib/dates';
import { planSchema, tidyPlan } from '@/lib/forms';
import { readGuest, updateGuest, useGuest, type GuestData } from '@/lib/guest';
import { progressFrom } from '@/lib/progress';

const earnedTitles = (d: GuestData) => new Set(progressFrom(d.plans, d.checkins, sgToday()).badges.filter((b) => b.earned).map((b) => b.title));

// The same forms as an account's My plans, saving to this device instead.
const actions: PlanActions = {
  async add(_prev, form) {
    const parsed = planSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
    const p = parsed.data;
    updateGuest((d) => ({ ...d, plans: [...d.plans, { id: d.nextId, moment: p.moment, ifText: tidyPlan(p.ifText), thenText: tidyPlan(p.thenText), active: true }], nextId: d.nextId + 1 }));
    return { status: 'ok' };
  },
  async update(_prev, form) {
    const parsed = planSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message };
    const id = Number(form.get('id'));
    const p = parsed.data;
    updateGuest((d) => ({ ...d, plans: d.plans.map((x) => (x.id === id ? { ...x, moment: p.moment, ifText: tidyPlan(p.ifText), thenText: tidyPlan(p.thenText) } : x)) }));
    return { status: 'ok' };
  },
  async toggle(form) {
    const id = Number(form.get('id'));
    updateGuest((d) => ({ ...d, plans: d.plans.map((x) => (x.id === id ? { ...x, active: form.get('active') === 'true' } : x)) }));
  },
  async remove(form) {
    const id = Number(form.get('id'));
    updateGuest((d) => ({ ...d, plans: d.plans.filter((x) => x.id !== id) }));
  },
  async checkIn(_prev, form) {
    const outcome = form.get('outcome') === 'ran' ? 'ran' : 'missed';
    const before = readGuest();
    const had = earnedTitles(before);
    const weekStart = progressFrom(before.plans, before.checkins, sgToday()).thisWeek;
    updateGuest((d) => ({ ...d, checkins: [...d.checkins.filter((c) => c.weekStart !== weekStart), { weekStart, outcome }] }));
    return { newBadges: [...earnedTitles(readGuest())].filter((t) => !had.has(t)) };
  },
};

export function GuestPlans() {
  const guest = useGuest();
  if (!guest) {
    return (
      <main className="wrap" style={{ paddingTop: 48, paddingBottom: 72 }} aria-busy="true">
        <p className="eyebrow">Loading what&apos;s saved on this device…</p>
      </main>
    );
  }
  return (
    <PlansDashboard
      who="Not signed in · saved on this device"
      view={progressFrom(guest.plans, guest.checkins, sgToday())}
      schedule=""
      remindersLabel="Reminders need an account"
      guest
      actions={actions}
      notice={<DeviceNote kind="plans" />}
      side={<GuestReminders kind="plans" />}
      after={<GuestSave kind="plans" />}
    />
  );
}
