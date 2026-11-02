import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';

export const c = {
  cream: '#FBF6EA',
  sand: '#F4ECDA',
  card: '#FFFDF7',
  ink: '#111111',
  body: '#3F3B35',
  muted: '#5E5A52',
  rule: '#E4DCCB',
  orange: '#F0924F',
  orangeText: '#A84A14',
  mint: '#A6DABA',
  greenText: '#2F6B4A',
  pink: '#E6A0B4',
  yellow: '#F3D58A',
};

export const display = "'Big Shoulders', 'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif";
export const sans = "'IBM Plex Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const mono = "'IBM Plex Mono', Menlo, Consolas, monospace";

export function Shell(props: {
  preview: string;
  tag?: string;
  reason: string;
  manageUrl: string;
  manageLabel?: string;
  unsubscribeUrl: string;
  // 'reset' swaps the IF/THEN wordmark for Reset your routine's.
  wordmark?: 'ifthen' | 'reset';
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        {/* Web fonts load in Apple Mail and some others; the rest fall back to the stacks below. */}
        <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@800;900&family=IBM+Plex+Mono:wght@600&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <Preview>{props.preview}</Preview>
      <Body style={{ margin: 0, padding: '24px 0', background: c.sand, fontFamily: sans, color: c.ink }}>
        <Container style={{ maxWidth: 576, background: c.card, borderRadius: 6, overflow: 'hidden' }}>
          <Section style={{ padding: '22px 28px 0' }}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tbody>
                <tr>
                  <td style={{ fontFamily: display, fontWeight: 900, fontSize: 28, lineHeight: '28px' }}>
                    {props.wordmark === 'reset' ? (
                      <>
                        RESET <span style={{ color: c.orangeText }}>YOUR ROUTINE</span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: c.orangeText }}>IF</span>
                        <span style={{ color: '#A9A193' }}>/</span>
                        <span style={{ color: c.greenText }}>THEN</span>
                      </>
                    )}
                  </td>
                  {props.tag ? (
                    <td align="right" style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: c.muted }}>
                      {props.tag}
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </table>
          </Section>
          {props.children}
          <Section style={{ marginTop: 28, padding: '20px 28px 24px', background: c.ink }}>
            <Text style={{ margin: 0, color: c.cream, fontSize: 13 }}>
              Anxious most days? <strong style={{ fontFamily: mono }}>mindline 1771</strong> · 24/7 call, text or chat.
            </Text>
            <Text style={{ margin: '10px 0 0', color: '#CFC8B8', fontSize: 13 }}>
              <Link href={props.manageUrl} style={{ color: c.mint }}>
                {props.manageLabel ?? 'Manage plans and reminders'}
              </Link>
              {' · '}
              <Link href={props.unsubscribeUrl} style={{ color: c.mint }}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={{ margin: '10px 0 0', color: '#CFC8B8', fontSize: 13 }}>{props.reason}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function PlanBlock(props: { ifText: string; thenText: string }) {
  return (
    <Section style={{ margin: '22px 28px 0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ background: c.orange, padding: '18px 22px', color: c.ink }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 900, fontSize: 52, lineHeight: '44px' }}>IF</Text>
        <Text style={{ margin: '8px 0 0', fontFamily: display, fontWeight: 800, fontSize: 28, lineHeight: '30px' }}>{props.ifText}</Text>
      </div>
      <div style={{ background: c.mint, padding: '14px 22px 20px', color: c.ink }}>
        <Text style={{ margin: 0, fontFamily: display, fontWeight: 900, fontSize: 46, lineHeight: '40px' }}>THEN</Text>
        <Text style={{ margin: '8px 0 0', fontFamily: display, fontWeight: 800, fontSize: 28, lineHeight: '30px' }}>{props.thenText}</Text>
      </div>
    </Section>
  );
}

export function Nudge(props: { text: string; label?: string }) {
  return (
    <Section style={{ margin: '24px 28px 0', paddingTop: 20, borderTop: `1px solid ${c.rule}` }}>
      <Text style={{ margin: 0, fontFamily: mono, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: c.muted }}>{props.label ?? "THIS WEEK'S CALM NUDGE"}</Text>
      <Text style={{ margin: '6px 0 0', fontSize: 17, lineHeight: '26px' }}>{props.text}</Text>
    </Section>
  );
}
