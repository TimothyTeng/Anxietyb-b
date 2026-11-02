import { z } from 'zod';
import { DECISIONS, FOLLOWED, MOMENTS, RESET_STATUSES, ROUTINE_AREAS } from './constants';

// Form rules shared by the server actions (signed in) and the on-device versions (not signed in).

export type FormState = { status: 'idle' | 'error' | 'list' | 'account' | 'ok' | 'conflict'; message?: string };

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const planSchema = z.object({
  ifText: z.string().trim().min(1, 'Fill in both halves to save.').max(200),
  thenText: z.string().trim().min(1, 'Fill in both halves to save.').max(200),
  moment: z.enum(MOMENTS),
});

// Plans read naturally without a leading "IF"/"THEN" or trailing punctuation the cards add themselves.
export const tidyPlan = (s: string) => s.replace(/^\s*(if|then)\b[\s,:]*/i, '').replace(/[.…]+\s*$/, '');

const hoursField = z.coerce.number({ error: 'Hours must be numbers.' }).min(0, 'Hours can’t be negative.').max(24, 'One day has 24 hours.');

export const daySchema = z.object({
  day: isoDay,
  sleep: hoursField,
  study: hoursField,
  active: hoursField,
  rest: hoursField,
  screen: hoursField,
  stress: z.coerce.number({ error: 'Choose how stressed you felt.' }).int().min(1, 'Choose how stressed you felt.').max(5),
  followed: z.enum(FOLLOWED).optional(),
  note: z.string().trim().max(300).default(''),
});

export function parseDay(form: FormData) {
  const parsed = daySchema.safeParse({ ...Object.fromEntries(form), followed: form.get('followed') || undefined, stress: form.get('stress') ?? '' });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const d = parsed.data;
  if (d.sleep + d.study + d.active + d.rest + d.screen > 24) return { error: 'That adds up to more than 24 hours. Check one of the numbers.' } as const;
  return { data: d } as const;
}

export const changeSchema = z.object({
  stressArea: z.enum(ROUTINE_AREAS),
  stressor: z.string().trim().max(200).default(''),
  insteadOf: z.string().trim().min(1, 'Fill in both “Instead of” and “I will” to start.').max(200),
  change: z.string().trim().min(1, 'Fill in both “Instead of” and “I will” to start.').max(200),
  start: isoDay,
});

// The fields read as one sentence on the page ("Instead of …, I will …"), so drop the lead-in words and end punctuation.
export const tidyChange = (s: string) => s.replace(/^\s*(instead of|i will|i'll)\b[\s,:]*/i, '').replace(/[.…]+\s*$/, '');

const rating = z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().int().min(1).max(5).nullable());

export const reviewSchema = z.object({
  obstacles: z.string().trim().max(600).default(''),
  helped: z.string().trim().max(600).default(''),
  wellbeingBefore: rating,
  wellbeingAfter: rating,
  decision: z.enum(DECISIONS, { error: 'Choose what you’ll do next to finish.' }),
});

export const parseReview = (form: FormData) =>
  reviewSchema.safeParse({
    obstacles: form.get('obstacles') ?? '',
    helped: form.get('helped') ?? '',
    wellbeingBefore: form.get('wellbeingBefore'),
    wellbeingAfter: form.get('wellbeingAfter'),
    decision: form.get('decision') ?? undefined,
  });

/** What a browser sends when moving its on-device plans and resets into an account. */
export const guestPayloadSchema = z.object({
  plans: z
    .array(z.object({ moment: z.enum(MOMENTS), ifText: z.string().trim().min(1).max(200), thenText: z.string().trim().min(1).max(200), active: z.boolean() }))
    .max(50),
  checkins: z.array(z.object({ weekStart: isoDay, outcome: z.enum(['ran', 'missed']) })).max(60),
  resets: z
    .array(
      z.object({
        id: z.number().int(),
        status: z.enum(RESET_STATUSES),
        auditStart: isoDay,
        stressArea: z.enum(ROUTINE_AREAS).nullable(),
        stressor: z.string().max(200).nullable(),
        insteadOf: z.string().max(200).nullable(),
        change: z.string().max(200).nullable(),
        trialStart: isoDay.nullable(),
        obstacles: z.string().max(600).nullable(),
        helped: z.string().max(600).nullable(),
        wellbeingBefore: z.number().int().min(1).max(5).nullable(),
        wellbeingAfter: z.number().int().min(1).max(5).nullable(),
        decision: z.enum(DECISIONS).nullable(),
      }),
    )
    .max(10),
  days: z.array(daySchema.extend({ resetId: z.number().int(), phase: z.enum(['audit', 'trial']), followed: z.enum(FOLLOWED).nullable() })).max(140),
});
export type GuestPayload = z.infer<typeof guestPayloadSchema>;
