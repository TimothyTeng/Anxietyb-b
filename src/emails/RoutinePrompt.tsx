import { Button, Section, Text } from '@react-email/components';
import { c, display, mono, Nudge, Shell } from './Shell';

type Props = {
  kind: 'log' | 'plan' | 'trial' | 'review';
  tag: string;
  /** "Wed 4 Nov" for a log prompt. */
  dayLabel: string | null;
  /** The plan prompt's stressful-days line, when there is one. */
  insight: string | null;
  insteadOf: string | null;
  change: string | null;
  followed: string | null;
  stress: string | null;
  note: string;
  actionUrl: string;
  manageUrl: string;
  unsubscribeUrl: string;
};

const HEAD = {
  log: 'How did yesterday go?',
  plan: "Your audit week is done. Here's what it shows.",
  trial: 'Your trial week starts today.',
  review: 'Trial week done. Time to look back.',
};

const btn = { marginTop: 14, background: c.ink, color: c.cream, padding: '13px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 } as const;
const kicker = { margin: 0, fontFamily: mono, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' } as const;

export default function RoutinePrompt(p: Props) {
  const body = {
    log: `Log ${p.dayLabel} while it's fresh. It takes about a minute: your hours of sleep, study and work, activity, screen time and rest, and how stressed you felt.`,
    plan: 'Now pick one recurring source of stress and one realistic change to try next week.',
    trial: 'You chose this while looking at your whole week. This week, just try it, and note what gets in the way.',
    review: 'See your two weeks side by side, say how it felt, and decide whether to keep your change, adjust it or try a new one. About 3 minutes.',
  }[p.kind];
  const button = { log: `Log ${p.dayLabel}`, plan: 'Choose my change', trial: 'See my trial week', review: 'Review my reset' }[p.kind];
  return (
    <Shell
      preview={p.kind === 'log' ? `Log ${p.dayLabel} in about a minute` : HEAD[p.kind]}
      tag={p.tag}
      wordmark="reset"
      reason="You're getting this because you started a reset on Reset your routine, part of IF / THEN."
      manageUrl={p.manageUrl}
      manageLabel="Manage your reset and daily emails"
      unsubscribeUrl={p.unsubscribeUrl}
    >
      <Section style={{ padding: '18px 28px 0' }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 40, lineHeight: '42px' }}>{HEAD[p.kind]}</Text>
        <Text style={{ margin: '10px 0 0', fontSize: 16, lineHeight: '25px', color: c.body }}>{body}</Text>
      </Section>
      {p.kind === 'plan' && p.insight ? (
        <Section style={{ margin: '22px 28px 0', padding: '18px 20px', background: c.yellow, borderRadius: 4 }}>
          <Text style={kicker}>YOUR STRESSFUL DAYS</Text>
          <Text style={{ margin: '6px 0 0', fontSize: 18, lineHeight: '27px', fontWeight: 600 }}>{p.insight}</Text>
        </Section>
      ) : null}
      {p.kind === 'trial' && p.insteadOf && p.change ? (
        <Section style={{ margin: '22px 28px 0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ background: c.sand, padding: '16px 22px' }}>
            <Text style={{ ...kicker, color: c.muted }}>INSTEAD OF</Text>
            <Text style={{ margin: '6px 0 0', fontFamily: display, fontWeight: 800, fontSize: 26, lineHeight: '28px' }}>{p.insteadOf}</Text>
          </div>
          <div style={{ background: c.yellow, padding: '16px 22px 20px' }}>
            <Text style={kicker}>I WILL</Text>
            <Text style={{ margin: '6px 0 0', fontFamily: display, fontWeight: 800, fontSize: 26, lineHeight: '28px' }}>{p.change}</Text>
          </div>
        </Section>
      ) : null}
      {p.kind === 'review' && p.followed && p.stress ? (
        <Section style={{ margin: '22px 28px 0', padding: '16px 20px', background: c.sand, borderRadius: 4 }}>
          <Text style={{ margin: 0, fontSize: 16 }}>
            <span style={{ fontFamily: mono, fontWeight: 600 }}>FOLLOWED {p.followed}</span> · average stress <span style={{ fontFamily: mono, fontWeight: 600 }}>{p.stress}</span>
          </Text>
        </Section>
      ) : null}
      <Section style={{ padding: '8px 28px 0' }}>
        <Button href={p.actionUrl} style={btn}>
          {button}
        </Button>
        {p.kind === 'log' ? (
          <Text style={{ margin: '12px 0 0', fontSize: 14, color: c.muted }}>Busy week? Fill in rough numbers. A rough day is more useful than a blank one.</Text>
        ) : null}
      </Section>
      <Nudge text={p.note} label="A NOTE FOR THIS WEEK" />
    </Shell>
  );
}

RoutinePrompt.PreviewProps = {
  kind: 'log',
  tag: 'AUDIT · DAY 3 OF 7',
  dayLabel: 'Wed 4 Nov',
  insight: null,
  insteadOf: null,
  change: null,
  followed: null,
  stress: null,
  note: "You're not grading the week, just noticing it.",
  actionUrl: '#',
  manageUrl: '#',
  unsubscribeUrl: '#',
} satisfies Props;
