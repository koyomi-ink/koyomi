'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  bookings: 'Bookings',
  clients: 'Clients',
  'digital-studio': 'Digital studio',
  insights: 'Insights',
  settings: 'Settings',
  'setup-progress': 'Setup progress',
  'whats-new': "What's new",
};

export function AppPageTitle() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);

  const section = segments[2];

  const title = section ? (pageTitles[section] ?? 'Koyomi') : 'Home';

  return <h1 className='text-sm font-medium'>{title}</h1>;
}
