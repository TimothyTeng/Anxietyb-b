import { Button, Section, Text } from '@react-email/components';
import { c, display, Shell } from './Shell';

type Props = { nudge: string; howUrl: string; plansUrl: string; unsubscribeUrl: string };

export default function CalmNudge(p: Props) {
  return (
    <Shell preview={p.nudge} tag="CALM NUDGE" reason="You're getting this because you joined the IF / THEN email list." manageUrl={p.plansUrl} unsubscribeUrl={p.unsubscribeUrl}>
      <Section style={{ padding: '18px 28px 0' }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 36, lineHeight: '40px' }}>{p.nudge}</Text>
      </Section>
      <Section style={{ padding: '20px 28px 0' }}>
        <Text style={{ margin: 0, fontSize: 16, lineHeight: '25px', color: c.body }}>
          Got a minute while you're calm? Turn this week's anxious moment into an if/then plan.
        </Text>
        <Button href={p.howUrl} style={{ marginTop: 14, background: c.orange, color: c.ink, padding: '13px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>
          Write a plan
        </Button>
      </Section>
    </Shell>
  );
}

CalmNudge.PreviewProps = { nudge: 'Small beats heroic.', howUrl: '#', plansUrl: '#', unsubscribeUrl: '#' } satisfies Props;
