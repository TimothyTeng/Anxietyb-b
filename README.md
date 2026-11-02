# IF / THEN campaign site

The IF / THEN engagement campaign as a working website, built from the design canvas (https://claude.ai/artifact/QhyPWxyzTfrTrm6KdHjaHy). Students can:

- **join the email list** with just an email address, to get a calm nudge every Monday and campaign news (follow-up poster emails);
- **create an account** by adding a password, to save if/then plans, get them emailed back as reminders (weekly by default), check in each week to build a streak, and earn badges;
- **reset their routine** (engagement idea 2) with the same account: log a week of sleep, study and work, physical activity, rest and screen time on a calendar, pick one recurring stress and a realistic change, try it for a week, then review the two weeks side by side.

Every page works at phone width.

**No account needed to start.** Signed out, My plans and My reset work the same way but save to the browser (localStorage, `src/lib/guest.ts`). A section at the bottom of each lets students create an account (with mailing-list consent) or sign in, which moves everything on the device into the account and clears it there (`src/app/guest/actions.ts`). If both the device and the account have a reset in progress, the student picks which to keep. Students who sign in another way get a banner offering to add what's on the device.

Stack: Next.js 15 (React 19), Neon Postgres via Drizzle ORM, Resend for email, Vercel Cron for the daily job.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Campaign home: hero, sign-up (email, optional password), campaign ideas, poster series |
| `/how-it-works` | How to write an if/then plan and why it works |
| `/plans` | Dashboard (saved on the device until the student signs in): plans, weekly check-in and streak, reminder frequency, calm nudges, badges |
| `/login` | Sign in |
| `/reset` | Reset your routine campaign page: the four steps, examples, why routines matter |
| `/reset/me` | Reset dashboard (saved on the device until the student signs in): two-week calendar, daily log, audit summary, change, trial, review, history, badges |
| `/checkin` | Where the "Yes, it ran / Not this time" buttons in reminder emails land |
| `/unsubscribe` | Unsubscribe or resubscribe (from the link in every email) |
| `/admin` | Password-protected: list numbers, write and send follow-up poster emails, run reminders now, export CSV |

## Emails

| Email | When | Who |
| --- | --- | --- |
| Welcome | On sign-up | Everyone (list and account versions) |
| Plan reminder | Daily job, 8:00 am SGT, on each account's reminder days | Accounts with active plans: weekly = Sunday, twice = Sunday + Wednesday, daily, or exam season only (`EXAM_PERIODS`) |
| Calm nudge | Daily job on Mondays | Everyone subscribed with calm nudges on |
| Reset prompt | Daily job, 8:00 am SGT, at most one a day | Accounts with a reset in progress: "log yesterday" (if not logged and daily emails are on), "audit done", "trial starts today", "time to review" |
| Follow-up poster email | When sent from `/admin` | Everyone subscribed |

Every email has an unsubscribe link and one-click unsubscribe headers. An `email_log` table records each send, so nobody gets the same email twice in a day, even if the job runs twice.

**Without `RESEND_API_KEY`, emails are printed to the server console instead of being sent.** That's how local development works out of the box.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run db:push              # creates the tables in your Neon database
npm run dev                  # http://localhost:3000
```

To run the daily email job by hand (dev only: `date` pretends it's that Singapore day):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/daily?date=2026-10-25"
```

## Environment variables

| Name | What |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `RESEND_API_KEY` | Resend API key. Empty = print emails to the console |
| `EMAIL_FROM` | Sender, e.g. `IF / THEN <hello@your-domain.com>` |
| `APP_URL` | Public URL of the site, used in email links |
| `SESSION_SECRET` | 32+ random characters: signs sessions and check-in links |
| `CRON_SECRET` | 32+ random characters: Vercel sends it to the cron route |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_EMAIL` | Where "Send test to me" goes |

## Turning on real email (Resend)

1. Create a free account at resend.com and make an API key. Put it in `RESEND_API_KEY`.
2. **Verify a domain** (Resend → Domains, then add the DNS records it shows). Until a domain is verified, Resend only delivers to your own Resend login address, so classmates won't receive anything.
3. Set `EMAIL_FROM` to an address on that domain.

The free plan allows 100 emails a day and 3,000 a month, which is fine for a pilot.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it at vercel.com/new (or run `npx vercel` here).
2. Add all the environment variables above in Project → Settings → Environment Variables, with `APP_URL` set to the Vercel URL.
3. Deploy. `vercel.json` schedules `/api/cron/daily` at 00:00 UTC (08:00 SGT). Vercel sends `CRON_SECRET` automatically.

Vercel's free plan runs cron jobs once a day, so reminders go out at a fixed 8:00 am. For reminders timed to each plan's moment, point an hourly external cron (e.g. cron-job.org) at the same route with the same header.

## Things to fill in or confirm

- `[Campaign name]` and the other awareness/engagement ideas (placeholders on the home page).
- `SEMESTER_START` and `EXAM_PERIODS` in `src/lib/content.ts`: confirm against the NTU calendar.
- The "94 studies, d ≈ 0.65" figure and the mindline 1771 details, as flagged in the campaign doc.
- The welcome, nudge and reminder copy lives in `src/emails/` and `src/lib/content.ts`.
- Reset your routine: the WHO 150-minute activity figure and the placeholder third fact on `/reset` (`[Figure]`, `[Source, year]`), plus the reset copy in `src/lib/content.ts` and `src/emails/RoutinePrompt.tsx`.

## Code map

- `src/app/`: pages, server actions (`actions.ts`, `admin/actions.ts`), API routes (cron, unsubscribe)
- `src/components/`: header and footer, sign-up card, poster, dashboard pieces, admin forms
- `src/emails/`: React Email templates
- `src/lib/`: campaign content, dates (Singapore weeks), streaks and badges, email sending, daily job; `routine.ts` (reset steps, calendar, summaries, which email is due) and `reset.ts` (loads a student's reset)
- `src/db/schema.ts`: tables (subscribers, users, plans, checkins, broadcasts, email_log, resets, routine_days)

## How a reset moves on

- **Audit:** starts today or up to 6 days back. The change step opens when all 7 days are logged, or once the week has ended with at least 3 logged (fewer than 3: the student starts a fresh audit).
- **Trial:** starts the day after the audit week ends (or today, if that has passed), or the day after that.
- **Review:** opens when all 7 trial days are logged, or once the trial week has ended.
- Days can be filled in late, up to today, while their week is active. Future days can't be logged.
