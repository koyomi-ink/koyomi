import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/react';

import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://koyomi.ink'),

  title: {
    default: 'Koyomi | Tattoo Booking & Studio Management',
    template: '%s | Koyomi',
  },

  description:
    'Booking and studio management built for tattoo artists. Manage booking requests, clients, tattoo projects, schedules, payments, reminders, and your Digital Studio in one place.',

  applicationName: 'Koyomi',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Koyomi | Tattoo Booking & Studio Management',
    description:
      'Manage booking requests, clients, tattoo projects, schedules, payments, and your Digital Studio in one place.',
    url: '/',
    siteName: 'Koyomi',
    type: 'website',
    locale: 'en_GB',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Koyomi | Tattoo Booking & Studio Management',
    description: 'Booking and studio management built for tattoo artists.',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body>
        <div>
          <main>
            <div>{children}</div>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
