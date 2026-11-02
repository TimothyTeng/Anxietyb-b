'use client';

import { useSyncExternalStore } from 'react';
import type { Followed, Moment, ResetStatus, RoutineArea, Decision } from './constants';
import type { GuestPayload } from './forms';

// Plans, check-ins and resets for students who haven't signed in, kept in this browser's localStorage.
// Signing in or creating an account moves them into the account (see saveGuest) and clears them here.

export type GuestPlan = { id: number; moment: Moment; ifText: string; thenText: string; active: boolean };
export type GuestCheckin = { weekStart: string; outcome: 'ran' | 'missed' };
export type GuestReset = {
  id: number;
  status: ResetStatus;
  auditStart: string;
  stressArea: RoutineArea | null;
  stressor: string | null;
  insteadOf: string | null;
  change: string | null;
  trialStart: string | null;
  obstacles: string | null;
  helped: string | null;
  wellbeingBefore: number | null;
  wellbeingAfter: number | null;
  decision: Decision | null;
  dailyEmails: boolean;
};
export type GuestDay = {
  resetId: number;
  day: string;
  phase: 'audit' | 'trial';
  sleep: number;
  study: number;
  active: number;
  rest: number;
  screen: number;
  stress: number;
  followed: Followed | null;
  note: string;
};
/** `resets` is newest first, like an account's. */
export type GuestData = { plans: GuestPlan[]; checkins: GuestCheckin[]; resets: GuestReset[]; days: GuestDay[]; nextId: number };

const KEY = 'ifthen.guest.v1';
const EMPTY: GuestData = { plans: [], checkins: [], resets: [], days: [], nextId: 1 };

let raw: string | null = null;
let cached: GuestData = EMPTY;
const listeners = new Set<() => void>();

function read(): GuestData {
  let next: string | null = null;
  try {
    next = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private mode, site data off): work from memory for this visit.
    return cached;
  }
  if (next !== raw) {
    raw = next;
    try {
      cached = next ? { ...EMPTY, ...(JSON.parse(next) as Partial<GuestData>) } : EMPTY;
    } catch {
      cached = EMPTY;
    }
  }
  return cached;
}

function write(data: GuestData) {
  cached = data;
  try {
    raw = JSON.stringify(data);
    window.localStorage.setItem(KEY, raw);
  } catch {
    // Kept in memory only.
  }
  listeners.forEach((l) => l());
}

export const readGuest = () => read();

export function updateGuest(fn: (d: GuestData) => GuestData) {
  write(fn(read()));
}

export function clearGuest() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  raw = null;
  cached = EMPTY;
  listeners.forEach((l) => l());
}

export const newId = (d: GuestData) => d.nextId;

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
}

/** This device's saved data, or null while the page is still loading (the server can't see it). */
export function useGuest(): GuestData | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export const hasGuestData = (d: GuestData | null) => Boolean(d && (d.plans.length || d.resets.some((r) => r.status !== 'stopped')));

export function guestPayload(d: GuestData): GuestPayload {
  const resets = d.resets.filter((r) => r.status !== 'stopped');
  const ids = new Set(resets.map((r) => r.id));
  return {
    plans: d.plans.map(({ moment, ifText, thenText, active }) => ({ moment, ifText, thenText, active })),
    checkins: d.checkins,
    resets: resets.map(({ dailyEmails: _, ...r }) => r),
    days: d.days.filter((x) => ids.has(x.resetId)),
  };
}
