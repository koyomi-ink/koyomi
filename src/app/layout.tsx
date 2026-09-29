import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/react';

import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://koyomi.ink'),
  title: 'Koyomi',
  description: 'Manage your tattoo business',
  keywords: ['tattoo', 'scheduling', 'booking', 'books', 'schedule', 'management', 'studio'],
  verification: {
    google: 'TODO - string here'
  },
  openGraph: {
    title: 'Koyomi',
    description: 'Manage your tattoo business',
    type: 'website',
    images: [
      {
        url: '/og.jpg',
        width: 800,
        height: 600,
      }
    ]
  }
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body>
        <div >
          <main >
            <div>{children}</div>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}