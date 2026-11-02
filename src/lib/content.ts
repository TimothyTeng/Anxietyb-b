import type { PosterKey, RoutineKey } from './constants';

// First Monday of the semester; the streak row labels weeks from here ("W1", "W2", …).
export const SEMESTER_START = '2026-08-10';

// Days when "Exam season only" reminders go out. [Confirm against the official NTU calendar.]
export const EXAM_PERIODS: { start: string; end: string }[] = [{ start: '2026-11-23', end: '2026-12-11' }];

export type Poster = {
  key: PosterKey;
  label: string;
  status: string;
  ifText: string;
  thenText: string;
  place: string;
  explain: string;
};

export const POSTERS: Poster[] = [
  {
    key: 'sleep',
    label: 'Sleep',
    status: '1:47 AM',
    ifText: "it's 11pm and I'm still scrolling…",
    thenText: 'my phone sleeps outside my room.',
    place: 'Hall rooms, residence corridors, bathroom mirrors',
    explain: 'Anxiety drives your fast brain. Plan with your slow brain first.',
  },
  {
    key: 'avoidance',
    label: 'Avoidance',
    status: 'WEEK 12',
    ifText: 'I want to skip revising again…',
    thenText: 'I start with just 5 minutes.',
    place: 'Libraries, study rooms, learning commons',
    explain: 'Avoiding feels better now and worse later. Decide the first step before the urge arrives.',
  },
  {
    key: 'body',
    label: 'The body',
    status: '118 BPM',
    ifText: 'my heart starts racing…',
    thenText: 'two breaths in, one long breath out.',
    place: 'Outside lecture theatres, presentation and exam halls',
    explain: "You can't think your way out of panic in the moment. Decide your first move now.",
  },
];

export const posterByKey = (key: string | null | undefined) => POSTERS.find((p) => p.key === key);

export const PAIRS = [
  {
    weak: "IF I feel stressed, THEN I'll study harder.",
    why: '"Stressed" is too vague to notice, and "study harder" pushes, which can backfire when you are anxious.',
    ifText: 'I want to skip revising again',
    thenText: 'I start with just 5 minutes',
    good: 'A clear moment, and a first step small enough to actually take.',
  },
  {
    weak: "IF I can't sleep, THEN I'll stop worrying.",
    why: 'You cannot decide to stop worrying. The step needs to be an action, not a feeling.',
    ifText: "it's 11pm and I'm still scrolling",
    thenText: 'my phone sleeps outside my room',
    good: 'A time you can see on the clock, and a physical action that removes the cue.',
  },
  {
    weak: "IF I get nervous presenting, THEN I'll calm down.",
    why: '"Calm down" is the goal, not a plan for getting there.',
    ifText: 'my heart starts racing',
    thenText: 'two breaths in, one long breath out',
    good: 'A body signal you will feel, paired with a step that takes seconds.',
  },
];

export const EVIDENCE = [
  { fig: '75.6% vs 20%', text: 'NTU students who know they need 7–9 hours of sleep, compared with those who get it. The gap is in action, not knowledge.', src: 'NTU, 2018' },
  { fig: 'd ≈ 0.65', text: 'Across 94 studies, if/then plans gave a medium-to-large boost to reaching goals.', src: 'Gollwitzer & Sheeran, 2006' },
  { fig: 'Fear ↓', text: 'Only people with an if/then plan reduced their fear and disgust reactions. Having the goal alone was not enough.', src: 'Schweiger Gallo et al., 2009' },
  { fig: 'Test anxiety', text: 'For highly test-anxious students, plans to ignore distractions protected exam performance, while "try harder" plans made it worse.', src: 'Parks-Stamm et al., 2010' },
  { fig: 'g = 0.45', text: 'Planning around the obstacle first (WOOP) helped 15,907 people reach their goals, with one of the largest effects among college students.', src: 'Wang et al., 2021' },
];

// Weekly calm nudges, rotated by week number. Sent to everyone on the list with nudges on.
export const NUDGES = [
  "A plan that doesn't run isn't a failure. It's information. If the moment slipped past, make the IF more specific or the THEN smaller.",
  "Your calm self is allowed to make decisions for your anxious self. That's all a plan is.",
  'Small beats heroic. Five minutes of revision you actually start counts for more than three hours you keep putting off.',
  "This week, just notice one moment when anxiety usually wins. You don't have to fix it yet.",
  'Sleep is a study tool. If tonight runs late, let your phone sleep somewhere else first.',
  'Two breaths in, one long breath out. It works best when you decide on it before you need it.',
];

export const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  twice: 'Twice a week',
  daily: 'Daily',
  exams: 'Exam season only',
};

export const FREQ_SCHEDULE: Record<string, string> = {
  weekly: 'Sundays, 8:00 am',
  twice: 'Sundays and Wednesdays, 8:00 am',
  daily: 'Every day, 8:00 am',
  exams: 'Every day in exam season, 8:00 am',
};

// ── Reset your routine ──────────────────────────────────────────────

// The five things logged each day, in the order the calendar stacks them. `hex` is for emails.
export const ROUTINE_FIELDS: { key: RoutineKey; label: string; color: string; hex: string }[] = [
  { key: 'sleep', label: 'Sleep', color: 'var(--green-dark)', hex: '#1F4D34' },
  { key: 'study', label: 'Study & work', color: 'var(--orange)', hex: '#F0924F' },
  { key: 'active', label: 'Physical activity', color: 'var(--mint)', hex: '#A6DABA' },
  { key: 'rest', label: 'Rest & social', color: 'var(--pink)', hex: '#E6A0B4' },
  { key: 'screen', label: 'Screen time', color: 'var(--grey)', hex: '#77716A' },
];

// Simple guides the audit summary compares against. [Confirm wording and sources.]
export const SLEEP_GUIDE = { min: 7, max: 9 };
export const ACTIVE_GUIDE_MIN = 150; // minutes a week, WHO (2020) [confirm]

export const RESET_STEPS = [
  { when: 'WEEK 1 · DAILY', color: 'var(--yellow)', title: 'Audit', body: 'Each day, log your hours of sleep, study and work, physical activity, screen time and rest, plus how stressed you felt. About a minute.', eg: 'Tue: 5 h sleep · 10 h study · stress 4' },
  { when: 'END OF WEEK 1', color: 'var(--orange)', title: 'Spot it', body: 'Your week on a calendar shows what your most stressful days have in common. Pick the one that keeps coming back.', eg: 'Stressful days: 2 h less sleep, 4 h more study' },
  { when: 'WEEK 2 · DAILY', color: 'var(--mint)', title: 'Try it', body: 'Make one realistic change and live with it for a week. Each day, note whether you followed it and what got in the way.', eg: 'Followed 5 of 7 days · group meeting ran late' },
  { when: 'END OF WEEK 2', color: 'var(--ink)', title: 'Review', body: 'Compare the two weeks side by side, say how your mood and energy changed, then keep it, adjust it or try a new change.', eg: 'Stress 3.1 → 2.3 · keep it' },
];

export const RESET_EXAMPLES = [
  { insteadOf: 'staying up till 3am to finish revising the night before', change: 'start revising at least 2 days before each test or deadline', area: 'STUDY & WORK · SLEEP', why: 'Moves the work earlier instead of asking you to work less.' },
  { insteadOf: 'going straight from my last lecture to my desk', change: 'take a 20-minute walk before I start any work', area: 'PHYSICAL ACTIVITY', why: 'Fits into a day that already exists, even a busy one.' },
  { insteadOf: 'saying yes to every project meeting and CCA call', change: 'keep two evenings a week with nothing scheduled', area: 'REST & SOCIAL', why: 'Protects rest the way you would protect a lecture.' },
];

// One line per prompt email, under "A note for this week".
export const RESET_NOTES: Record<'log' | 'plan' | 'trial' | 'review', string> = {
  log: "You're not grading the week, just noticing it. Honest numbers beat good-looking ones.",
  plan: 'Pick the change you could keep on your busiest day, not your best one.',
  trial: "A day you don't follow it isn't a failure. Write down what got in the way: that's the useful part.",
  review: "If the change didn't stick, it was probably too big. Make it smaller and try again.",
};

// ── All campaigns: the awareness ideas ──────────────────────────────

export const CAMPAIGN_INTRO =
  'We build anxiety-relieving habits into the places youths already pass through every day, like the MRT, station stairs and waiting areas, so trying them takes no extra effort. Each idea is something to do, not just something to read: try it once on the way somewhere, and it becomes easier to reach for next time.';

export const ANXIETY_STAT = {
  fig: '27%',
  text: 'of youths in Singapore reported severe or extremely severe symptoms of anxiety, the most common youth mental health problem here.',
  src: 'IMH National Youth Mental Health Study, 2024 [confirm source]',
};

export type AwarenessIdea = {
  id: string;
  n: string;
  title: string;
  tagline: string;
  image: string;
  alt: string;
  points: string[];
  body: string;
  extra?: string;
};

export type AwarenessGroup = { id: string; part: string; concept: string; explain: string; ideas: AwarenessIdea[] };

export const AWARENESS_GROUPS: AwarenessGroup[] = [
  {
    id: 'experiencing-self',
    part: 'Awareness · Part 1',
    concept: 'Remembering self vs experiencing self',
    explain:
      'Anxiety often lives in the remembering self: replaying what went wrong and rehearsing what might. These sensory activities pull you into the experiencing self. Folding paper or letting out a scream means actively releasing your emotions and being in the moment.',
    ideas: [
      {
        id: 'fold-for-thought',
        n: '#1',
        title: 'Fold for Thought',
        tagline: 'Fold an origami heart on your commute.',
        image: '/campaigns/fold-for-thought.webp',
        alt: 'A "How to fold a heart" handout card with six folding steps, a tear-off pad of paper squares and a QR code, labelled "your daily dose".',
        points: ['Handouts in public spaces, like MRT handles', 'Easy to do, and quick', 'Fold an origami heart'],
        body: 'Tear-off handouts sit where youths commute and go about their day. Folding the heart is a short, hands-on break that keeps you grounded in the moment and gives you a pause from anxious thoughts.',
        extra:
          'The back of each sheet carries a kind note, like "Hope your day gets better." Keep the heart, or pass it to a friend or a stranger and enjoy spreading a little love. The QR code links to this site.',
      },
      {
        id: 'calm-me-down-pod',
        n: '#2',
        title: 'Calm-me-down Pod',
        tagline: 'A soundproof pod to talk it out, or scream it out.',
        image: '/campaigns/calm-me-down-pod.webp',
        alt: 'Illustration of two pods: in one, a girl talks to a friendly AI face on a digital mirror; in the other, a girl screams into a padded wall that says "Scream it out!".',
        points: ['AI digital mirror chatbot', 'Soundproof scream corner'],
        body: 'Inside a private pod, a digital mirror with an AI chatbot listens to your rants and validates how you feel, helping you work through your emotions. If it would help, the pod prompts you to let out your frustration with a scream.',
        extra: 'Screaming can help ease frustration and anxiety. [Add source]',
      },
    ],
  },
  {
    id: 'mind-body',
    part: 'Awareness · Part 2',
    concept: 'Mind-body connection',
    explain:
      'What you do with your body can change how your mind feels. Mindful Screening brings in breathing exercises and Wellness Steps brings in everyday movement, both in familiar public spaces, so these habits are easy to practise again and again and help with managing anxiety.',
    ideas: [
      {
        id: 'mindful-screening',
        n: '#3',
        title: 'Mindful Screening',
        tagline: 'Breathing exercises instead of ads on the MRT.',
        image: '/campaigns/mindful-screening.webp',
        alt: 'An MRT train interior with the digital screen above the door showing a breathing animation that says "Breathe out".',
        points: ['Easy-to-follow exercises', 'Convenient and discreet', 'Builds independent habits'],
        body: 'Digital ad screens on public transport play short animated breathing exercises, like box breathing and 4-7-8 breathing. Riders can follow along to relax for a moment and ease their anxiety, right in their seat.',
      },
      {
        id: 'wellness-steps',
        n: '#4',
        title: 'Wellness Steps',
        tagline: 'Footprints and prompts that turn stairs into a small win.',
        image: '/campaigns/wellness-steps.webp',
        alt: 'A station staircase between two escalators, each step printed with prompts like "Keep going!" and "10 steps = 1 metre higher", with footprint stickers on the floor leading to it.',
        points: ['Encourages stair use', 'Fits into existing routines', 'Builds lasting active habits'],
        body: 'Footprint stickers along walkways lead to the stairs, with a QR code to this site. Motivational prompts on the steps encourage youths to take the stairs, turning a routine journey into a bit of physical activity.',
      },
    ],
  },
];
