import 'server-only';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db, resets, routineDays } from '@/db';
import { sgToday } from './dates';
import { computeReset } from './routine';

/** Everything the reset pages need for one account, the way progressFor does for plans. */
export async function resetFor(userId: number, today = sgToday()) {
  const all = await db.select().from(resets).where(eq(resets.userId, userId)).orderBy(desc(resets.createdAt));
  const days = all.length ? await db.select().from(routineDays).where(inArray(routineDays.resetId, all.map((r) => r.id))) : [];
  return computeReset(all, days, today);
}

export async function activeReset(userId: number) {
  const [r] = await db
    .select()
    .from(resets)
    .where(and(eq(resets.userId, userId), inArray(resets.status, ['audit', 'trial'])))
    .orderBy(desc(resets.createdAt))
    .limit(1);
  return r ?? null;
}
