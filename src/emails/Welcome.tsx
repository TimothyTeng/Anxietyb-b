import { Button, Section, Text } from '@react-email/components';
import { c, display, Nudge, PlanBlock, Shell } from './Shell';

type Props = { account: boolean; plansUrl: string; howUrl: string; unsubscribeUrl: string };

export default function Welcome({ account, plansUrl, howUrl, unsubscribeUrl }: Props) {
  return (
    <Shell
      preview={account ? 'Your account is ready. Next: write your first plan.' : "You're on the list. Here's how IF / THEN works."}
      tag={account ? 'ACCOUNT CREATED' : 'WELCOME'}
      reason="You're getting this because you signed up on the IF / THEN site."
      manageUrl={plansUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={{ padding: '18px 28px 0' }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 40, lineHeight: '42px' }}>
          {account ? 'Next: write your first plan.' : "You're on the list."}
        </Text>
        <Text style={{ margin: '10px 0 0', fontSize: 16, lineHeight: '25px', color: c.body }}>
          IF / THEN helps you make the choice before anxiety makes it for you. While you're calm, link the moment anxiety usually wins to one small step. When that
          moment arrives, the plan runs instead of the panic.
        </Text>
      </Section>
      <PlanBlock ifText="it's 11pm and I'm still scrolling…" thenText="my phone sleeps outside my room." />
      <Section style={{ padding: '24px 28px 0' }}>
        <Text style={{ margin: 0, fontSize: 16, lineHeight: '25px', color: c.body }}>
          {account
            ? 'Write one plan a week, get it emailed back to you, and check in to build your streak. Your first plan earns your first badge.'
            : 'About once a week we will send a short calm nudge, plus news of new posters and campaign events. Add a password on the site any time to save your own plans.'}
        </Text>
        <Button href={account ? plansUrl : howUrl} style={{ marginTop: 16, background: c.orange, color: c.ink, padding: '13px 18px', borderRadius: 4, fontWeight: 600, fontSize: 15 }}>
          {account ? 'Write my first plan' : 'How to write a plan'}
        </Button>
      </Section>
      <Nudge label="ONE THING TO TRY" text="Notice one moment this week when anxiety usually wins: a time, a place or a feeling in your body. That moment is your IF." />
    </Shell>
  );
}

Welcome.PreviewProps = { account: true, plansUrl: '#', howUrl: '#', unsubscribeUrl: '#' } satisfies Props;
