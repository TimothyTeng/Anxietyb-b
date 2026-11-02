import { eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { db, subscribers } from '@/db';

// One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header.
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token) await db.update(subscribers).set({ status: 'unsubscribed' }).where(eq(subscribers.unsubscribeToken, token));
  return new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  return NextResponse.redirect(new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, req.url));
}
