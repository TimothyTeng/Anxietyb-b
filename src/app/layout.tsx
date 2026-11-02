import type { Metadata } from 'next';
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const display = Big_Shoulders({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--font-display', adjustFontFallback: false });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Anxiety b&b', template: '%s · Anxiety b&b' },
  description: 'Small, everyday ways for youths to notice anxiety and do something about it: if/then plans, a two-week routine reset, and calm moments on the commute.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
