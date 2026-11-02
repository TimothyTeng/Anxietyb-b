import { NextResponse, type NextRequest } from 'next/server';
import { runDaily } from '@/lib/campaign';
import { sgToday } from '@/lib/dates';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron calls this daily at 00:00 UTC (08:00 SGT) with "Authorization: Bearer $CRON_SECRET".
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }
  // Outside production, ?date=YYYY-MM-DD runs the job as if it were that Singapore day.
  const override = req.nextUrl.searchParams.get('date');
  const today = process.env.NODE_ENV !== 'production' && override && /^\d{4}-\d{2}-\d{2}$/.test(override) ? override : sgToday();
  const result = await runDaily(today);
  console.log('[cron:daily]', result);
  return NextResponse.json(result);
}
