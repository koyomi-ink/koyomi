'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAppPanel } from '@/components/app-panel/app-panel-provider';

import {
  BookOpen,
  ChartLine,
  Check,
  ChevronsUpDown,
  CircleDashedCheck,
  Copy,
  ExternalLink,
  GlobeCode,
  LayoutDashboard,
  LogOut,
  Mailbox,
  Settings,
  Users,
} from 'lucide-react';

import { GuardedLink } from '@/components/app-panel/guarded-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { logout } from '@/features/auth/actions/logout';

type Studio = {
  id: string;
  name: string;
  slug: string;
};

type StudioMembership = {
  id: string;
  role: string;
  studio_id: string;
  studios: Studio | null;
};

type AppSidebarProps = {
  currentStudio: Studio;
  memberships: StudioMembership[];
};

export function AppSidebar({ currentStudio, memberships }: AppSidebarProps) {
  const menuItems = [
    {
      title: 'Home',
      url: `/app/${currentStudio.slug}`,
      icon: LayoutDashboard,
    },
    {
      title: 'Bookings',
      url: `/app/${currentStudio.slug}/bookings`,
      icon: BookOpen,
    },
    {
      title: 'Clients',
      url: `/app/${currentStudio.slug}/clients`,
      icon: Users,
    },
    {
      title: 'Digital studio',
      url: `/app/${currentStudio.slug}/digital-studio`,
      icon: GlobeCode,
    },
    {
      title: 'Insights',
      url: `/app/${currentStudio.slug}/insights`,
      icon: ChartLine,
    },
    {
      title: 'Settings',
      url: `/app/${currentStudio.slug}/settings`,
      icon: Settings,
    },
    {
      title: 'Setup progress',
      url: `/app/${currentStudio.slug}/setup-progress`,
      icon: CircleDashedCheck,
    },
    {
      title: "What's new",
      url: `/app/${currentStudio.slug}/whats-new`,
      icon: Mailbox,
    },
  ];

  const [copied, setCopied] = useState(false);

  const { runGuardedAction, isSaving } = useAppPanel();

  async function handleCopyBookingUrl() {
    await navigator.clipboard.writeText(`https://koyomi.ink/${currentStudio.slug}`);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg border'>
                    {currentStudio.name.charAt(0).toUpperCase()}
                  </div>

                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{currentStudio.name}</span>
                  </div>

                  <ChevronsUpDown className='ml-auto' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className='min-w-56' align='start' side='bottom' sideOffset={4}>
                {/* <DropdownMenuLabel>Studios</DropdownMenuLabel> */}

                {/* {memberships.map((membership) => {
                  if (!membership.studios) {
                    return null;
                  }

                  return (
                    <DropdownMenuItem key={membership.id} asChild>
                      <GuardedLink href={`/app/${membership.studios.slug}`}>
                        <div className='flex size-6 items-center justify-center rounded-md border'>
                          {membership.studios.name.charAt(0).toUpperCase()}
                        </div>

                        <span>{membership.studios.name}</span>
                      </GuardedLink>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator /> */}

                <DropdownMenuItem
                  disabled={isSaving}
                  onSelect={() => {
                    runGuardedAction(logout);
                  }}
                >
                  <LogOut />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className='flex items-center gap-1'>
              <SidebarMenuButton asChild tooltip='Open digital hub' className='min-w-0 flex-1'>
                <Link href={`/${currentStudio.slug}`} target='_blank' rel='noopener noreferrer'>
                  <ExternalLink />

                  <span className='truncate'>koyomi.ink/{currentStudio.slug}</span>
                </Link>
              </SidebarMenuButton>

              <button
                type='button'
                onClick={handleCopyBookingUrl}
                className='hover:bg-sidebar-accent flex size-8 shrink-0 items-center justify-center rounded-md group-data-[collapsible=icon]:hidden'
                aria-label='Copy booking URL'
                title={copied ? 'Copied!' : 'Copy booking URL'}
              >
                {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <GuardedLink href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </GuardedLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
