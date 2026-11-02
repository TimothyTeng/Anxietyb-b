import { render } from '@react-email/render';
import { NextResponse, type NextRequest } from 'next/server';
import { broadcastEmail } from '@/lib/campaign';
import { POSTER_KEYS, type PosterKey } from '@/lib/constants';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  if (!(await getSession()).admin) return new NextResponse('Not signed in', { status: 401 });
  const q = req.nextUrl.searchParams;
  const key = q.get('posterKey');
  const posterKey = POSTER_KEYS.includes(key as PosterKey) ? (key as PosterKey) : null;
  const html = await render(broadcastEmail({ subject: q.get('subject') ?? '', body: q.get('body') ?? '', posterKey }, 'preview'));
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
