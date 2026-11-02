import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, subscribers, users } from '@/db';
import { getSession } from '@/lib/session';

const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await getSession()).admin) return new NextResponse('Not signed in', { status: 401 });
  const rows = await db
    .select({ email: subscribers.email, status: subscribers.status, nudges: subscribers.nudges, joined: subscribers.createdAt, account: users.id, freq: users.reminderFreq })
    .from(subscribers)
    .leftJoin(users, eq(users.subscriberId, subscribers.id))
    .orderBy(asc(subscribers.createdAt));
  const lines = [
    'email,status,calm_nudges,has_account,reminder_frequency,joined',
    ...rows.map((r) => [r.email, r.status, r.nudges, r.account ? 'yes' : 'no', r.freq ?? '', r.joined.toISOString()].map(cell).join(',')),
  ];
  return new NextResponse(lines.join('\n'), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="ifthen-subscribers.csv"' },
  });
}
