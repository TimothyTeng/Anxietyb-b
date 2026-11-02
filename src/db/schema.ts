import { boolean, date, index, integer, pgTable, real, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { DECISIONS, FOLLOWED, MOMENTS, POSTER_KEYS, REMINDER_FREQS, RESET_STATUSES, ROUTINE_AREAS } from '../lib/constants';

export * from '../lib/constants';

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status', { enum: ['subscribed', 'unsubscribed'] }).notNull().default('subscribed'),
  nudges: boolean('nudges').notNull().default(true),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  consentAt: timestamp('consent_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  subscriberId: integer('subscriber_id').notNull().unique().references(() => subscribers.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  reminderFreq: text('reminder_freq', { enum: REMINDER_FREQS }).notNull().default('weekly'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moment: text('moment', { enum: MOMENTS }).notNull(),
  ifText: text('if_text').notNull(),
  thenText: text('then_text').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checkins = pgTable(
  'checkins',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    weekStart: date('week_start').notNull(),
    outcome: text('outcome', { enum: ['ran', 'missed'] }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('checkins_user_week').on(t.userId, t.weekStart)],
);

export const broadcasts = pgTable('broadcasts', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  posterKey: text('poster_key', { enum: POSTER_KEYS }),
  body: text('body').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  recipientCount: integer('recipient_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailLog = pgTable(
  'email_log',
  {
    id: serial('id').primaryKey(),
    subscriberId: integer('subscriber_id').notNull().references(() => subscribers.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['welcome', 'reminder', 'broadcast', 'nudge', 'routine'] }).notNull(),
    refId: text('ref_id').notNull().default(''),
    sentOn: date('sent_on').notNull(),
    resendId: text('resend_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('email_log_once').on(t.subscriberId, t.kind, t.refId, t.sentOn)],
);

// Reset your routine: one row per two-week cycle (audit week, then trial week).
export const resets = pgTable(
  'resets',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: RESET_STATUSES }).notNull().default('audit'),
    auditStart: date('audit_start').notNull(),
    stressArea: text('stress_area', { enum: ROUTINE_AREAS }),
    stressor: text('stressor'),
    insteadOf: text('instead_of'),
    change: text('change'),
    trialStart: date('trial_start'),
    obstacles: text('obstacles'),
    helped: text('helped'),
    wellbeingBefore: integer('wellbeing_before'),
    wellbeingAfter: integer('wellbeing_after'),
    decision: text('decision', { enum: DECISIONS }),
    dailyEmails: boolean('daily_emails').notNull().default(true),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('resets_user').on(t.userId)],
);

export const routineDays = pgTable(
  'routine_days',
  {
    id: serial('id').primaryKey(),
    resetId: integer('reset_id').notNull().references(() => resets.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    phase: text('phase', { enum: ['audit', 'trial'] }).notNull(),
    sleep: real('sleep').notNull(),
    study: real('study').notNull(),
    active: real('active').notNull(),
    rest: real('rest').notNull(),
    screen: real('screen').notNull(),
    stress: integer('stress').notNull(),
    followed: text('followed', { enum: FOLLOWED }),
    note: text('note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('routine_days_reset_day').on(t.resetId, t.day)],
);

export type Subscriber = typeof subscribers.$inferSelect;
export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Checkin = typeof checkins.$inferSelect;
export type Broadcast = typeof broadcasts.$inferSelect;
export type Reset = typeof resets.$inferSelect;
export type RoutineDay = typeof routineDays.$inferSelect;
