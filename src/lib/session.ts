import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type SessionData = { userId?: number; admin?: boolean };

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'ifthen_session',
    cookieOptions: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', httpOnly: true },
  });
}

export function randomToken(): string {
  return randomBytes(24).toString('base64url');
}

// Signs data placed in email links (check-in buttons), so they work without signing in.
export function sign(value: string): string {
  return createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('base64url').slice(0, 32);
}

export function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// Only same-site paths, so a crafted ?next= link can't send people elsewhere after signing in.
export function safeNext(next: unknown): string {
  const s = typeof next === 'string' ? next : '';
  return s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\') ? s : '/plans';
}

export function appUrl(path = ''): string {
  return `${(process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')}${path}`;
}
