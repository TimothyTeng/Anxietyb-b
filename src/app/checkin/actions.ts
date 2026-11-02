'use server';

import { redirect } from 'next/navigation';
import { checkins, db } from '@/db';
import { sgToday, weekStartOf } from '@/lib/dates';
import { verify } from '@/lib/session';

export async function recordEmailCheckin(form: FormData) {
  const [u, o, s] = ['u', 'o', 's'].map((k) => String(form.get(k) ?? ''));
  const outcome = o === 'ran' ? 'ran' : 'missed';
  // Records the week the button is pressed in, so the link from Sunday's email works all week.
  const ok = /^\d+$/.test(u) && verify(`checkin.${u}`, s);
  if (!ok) redirect('/checkin?done=bad');
  await db
    .insert(checkins)
    .values({ userId: Number(u), weekStart: weekStartOf(sgToday()), outcome })
    .onConflictDoUpdate({ target: [checkins.userId, checkins.weekStart], set: { outcome } });
  redirect(`/checkin?done=ok&o=${outcome}`);
}
