import { Button, Section, Text } from '@react-email/components';
import type { Poster } from '@/lib/content';
import { c, display, mono, PlanBlock, Shell } from './Shell';

type Props = { subject: string; body: string; poster: Poster | null; howUrl: string; plansUrl: string; unsubscribeUrl: string };

export default function Broadcast(p: Props) {
  const paragraphs = p.body.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return (
    <Shell preview={paragraphs[0] ?? p.subject} tag="CAMPAIGN NEWS" reason="You're getting this because you joined the IF / THEN email list." manageUrl={p.plansUrl} unsubscribeUrl={p.unsubscribeUrl}>
      <Section style={{ padding: '18px 28px 0' }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 40, lineHeight: '42px' }}>{p.subject}</Text>
      </Section>
      {p.poster ? (
        <>
          <PlanBlock ifText={p.poster.ifText} thenText={p.poster.thenText} />
          <Section style={{ padding: '10px 28px 0' }}>
            <Text style={{ margin: 0, fontFamily: mono, fontSize: 12, color: c.muted }}>
              {p.poster.label.toUpperCase()} POSTER · {p.poster.place}
            </Text>
          </Section>
        </>
      ) : null}
      <Section style={{ padding: '18px 28px 0' }}>
        {paragraphs.map((para, i) => (
          <Text key={i} style={{ margin: '0 0 14px', fontSize: 16, lineHeight: '25px', color: c.body, whiteSpace: 'pre-line' }}>
            {para}
          </Text>
        ))}
        <Button href={p.howUrl} style={{ marginTop: 4, background: c.orange, color: c.ink, padding: '13px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>
          Write your own plan
        </Button>
      </Section>
    </Shell>
  );
}

Broadcast.PreviewProps = {
  subject: 'New poster: the night before',
  body: 'Spotted this one in your hall?\n\nTear off a tab and write your own.',
  poster: null,
  howUrl: '#',
  plansUrl: '#',
  unsubscribeUrl: '#',
} satisfies Props;
