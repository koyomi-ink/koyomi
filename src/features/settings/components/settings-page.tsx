'use client';

import { ChevronRight } from 'lucide-react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAppPanel } from '@/components/app-panel/app-panel-provider';

import { MainProfileForm } from '@/features/settings/components/main-profile-form';

const sections = [
  {
    title: 'Public profile',
    items: [
      {
        title: 'Main profile',
        description: 'Business name, avatar, bio, social media links, digital hub link, and book status',
      },
      {
        title: 'Contact information',
        description: 'How clients can contact your studio',
      },
    ],
  },
  {
    title: 'Locations & availability',
    items: [
      {
        title: 'Locations',
        description: 'Permanent or temporary spots your clients can visit',
      },
      {
        title: 'Availability',
        description: 'Working hours and availability for books',
      },
    ],
  },
  {
    title: 'Rules & policies',
    items: [
      {
        title: 'Booking rules',
        description: 'Advance booking and payment windows',
      },
      {
        title: 'Policies',
        description: 'Cancellation, lateness, guest, and custom policies',
      },
      {
        title: 'Care instructions',
        description: 'Beforecare and aftercare information',
      },
    ],
  },
  {
    title: 'Pricing & rates',
    items: [
      {
        title: 'Flash',
        description: 'Reusable pricing for flash tattoos',
      },
      {
        title: 'Customs',
        description: 'Pricing templates for custom work',
      },
    ],
  },
  {
    title: 'Notifications',
    items: [
      {
        title: 'Client notifications',
        description: 'Automated reminders and follow-ups clients receive',
      },
      {
        title: 'Your notifications',
        description: 'Reminders, alerts, and updates you receive',
      },
    ],
  },
  {
    title: 'Billing & integrations',
    items: [
      {
        title: 'Koyomi subscription',
        description: 'Your subscription',
      },
      {
        title: 'Bank account',
        description: 'TODO - CHANGE THIS TO BE MORE CLEAR THAT ITS THE PAYMENT METHOD THAT IS DISPLAYED DURING CHECKOUT',
      },
      {
        title: 'Calendar sync',
        description: 'External calendars',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Security',
        description: 'Your account access',
      },
    ],
  },
];

type SettingsPageProps = {
  studio: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
  };
};

export function SettingsPage({
  studio,
}: SettingsPageProps) {
  const { togglePanel } = useAppPanel();

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Settings
        </h1>

        <p className='text-sm text-muted-foreground'>
          Manage your studio and account.
        </p>
      </div>

      {sections.map((section) => (
        <section
          key={section.title}
          className='space-y-3'
        >
          <h2 className='text-lg font-semibold'>
            {section.title}
          </h2>

          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {section.items.map((item) => (
              <Card
                key={item.title}
                className='gap-0 overflow-hidden p-0 transition-colors hover:bg-accent'
              >
                <button
                  type='button'
                  className='w-full cursor-pointer text-left'
                  onClick={() =>
                    togglePanel({
                      id: `${section.title}:${item.title}`,
                      title: item.title,
                      content:
                        item.title === 'Main profile' &&
                        section.title === 'Public profile' ? (
                          <MainProfileForm studio={studio} />
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            {item.description}
                          </p>
                        ),
                    })
                  }
                >
                  <CardHeader className='flex flex-row items-center justify-between gap-4 py-6'>
                    <div className='space-y-1'>
                      <CardTitle className='text-base'>
                        {item.title}
                      </CardTitle>

                      <CardDescription>
                        {item.description}
                      </CardDescription>
                    </div>

                    <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
                  </CardHeader>
                </button>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}