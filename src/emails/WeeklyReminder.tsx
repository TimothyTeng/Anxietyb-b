import { Button, Section, Text } from '@react-email/components';
import { c, display, mono, Nudge, PlanBlock, Shell } from './Shell';

type Props = {
  firstName: string | null;
  ifText: string;
  thenText: string;
  streak: number;
  nextBadge: number | null;
  nudge: string;
  ranUrl: string;
  missedUrl: string;
  plansUrl: string;
  unsubscribeUrl: string;
};

export default function WeeklyReminder(p: Props) {
  const toGo = p.nextBadge ? p.nextBadge - p.streak : 0;
  return (
    <Shell
      preview={`IF ${p.ifText}…`}
      tag={p.streak > 0 ? `${p.streak}-WEEK STREAK` : undefined}
      reason="You're getting this because you saved a plan on IF / THEN and chose email reminders."
      manageUrl={p.plansUrl}
      unsubscribeUrl={p.unsubscribeUrl}
    >
      <Section style={{ padding: '18px 28px 0' }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 40, lineHeight: '42px' }}>
          {p.firstName ? `Hi ${p.firstName}, here's this week's plan.` : "Here's this week's plan."}
        </Text>
        <Text style={{ margin: '10px 0 0', fontSize: 16, lineHeight: '25px', color: c.body }}>
          You wrote this while you were calm. When the moment comes, all you have to do is follow it.
        </Text>
      </Section>
      <PlanBlock ifText={p.ifText} thenText={p.thenText} />
      <Section style={{ padding: '24px 28px 0' }}>
        <Text style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>At the end of the week, tell us how it went</Text>
        <Text style={{ margin: '2px 0 0', fontSize: 15, color: c.body }}>One tap checks you in and keeps your streak going. Either answer counts.</Text>
        <Button href={p.ranUrl} style={{ marginTop: 14, marginRight: 10, background: c.orange, color: c.ink, padding: '13px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>
          Yes, it ran
        </Button>
        <Button href={p.missedUrl} style={{ marginTop: 14, border: `1.5px solid ${c.ink}`, color: c.ink, padding: '12px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>
          Not this time
        </Button>
      </Section>
      {p.nextBadge && toGo > 0 ? (
        <Section style={{ margin: '24px 28px 0', padding: '16px 20px', background: c.sand, borderRadius: 4 }}>
          <Text style={{ margin: 0, fontSize: 15 }}>
            <span style={{ fontFamily: mono, fontWeight: 600, color: c.greenText }}>{toGo === 1 ? 'ONE MORE CHECK-IN' : `${toGo} MORE WEEKS`}</span> earns your {p.nextBadge}-week streak badge.
          </Text>
        </Section>
      ) : null}
      <Nudge text={p.nudge} />
    </Shell>
  );
}

WeeklyReminder.PreviewProps = {
  firstName: null,
  ifText: "it's 11pm and I'm still scrolling",
  thenText: 'my phone sleeps outside my room',
  streak: 3,
  nextBadge: 4,
  nudge: "A plan that doesn't run isn't a failure. It's information.",
  ranUrl: '#',
  missedUrl: '#',
  plansUrl: '#',
  unsubscribeUrl: '#',
} satisfies Props;
