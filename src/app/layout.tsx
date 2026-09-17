import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Koyomi',
  description: 'Manage your tattoo business',
  keywords: ['tattoo, scheduling, booking, books, schedule, management, studio'],
  verification: {
    google: 'TODO - string here'
  },
  openGraph: {
    title: 'Koyomi',
    description: 'Manage your tattoo business',
    type: 'website',
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