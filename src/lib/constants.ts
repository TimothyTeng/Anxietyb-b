// Plain constants shared by the database schema and client components (no server imports here).
export const MOMENTS = ['Sleep', 'Avoidance', 'The body', 'Something else'] as const;
export type Moment = (typeof MOMENTS)[number];

export const REMINDER_FREQS = ['weekly', 'twice', 'daily', 'exams'] as const;
export type ReminderFreq = (typeof REMINDER_FREQS)[number];

export const POSTER_KEYS = ['sleep', 'avoidance', 'body'] as const;
export type PosterKey = (typeof POSTER_KEYS)[number];

// Reset your routine
export const RESET_STATUSES = ['audit', 'trial', 'done', 'stopped'] as const;
export type ResetStatus = (typeof RESET_STATUSES)[number];

export const ROUTINE_AREAS = ['Sleep', 'Study & work', 'Physical activity', 'Screen time', 'Rest & social'] as const;
export type RoutineArea = (typeof ROUTINE_AREAS)[number];

// The hours logged each day, in the order the calendar stacks them.
export const ROUTINE_KEYS = ['sleep', 'study', 'active', 'rest', 'screen'] as const;
export type RoutineKey = (typeof ROUTINE_KEYS)[number];

export const FOLLOWED = ['yes', 'partly', 'no'] as const;
export type Followed = (typeof FOLLOWED)[number];

export const DECISIONS = ['keep', 'adjust', 'new'] as const;
export type Decision = (typeof DECISIONS)[number];
