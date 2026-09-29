'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  Users,
  GlobeCode,
  ChartLine,
  CircleDashedCheck,
  Mailbox,
  BookOpen,
} from 'lucide-react';

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

const menuItems = [
  {
    title: 'Home',
    url: '/app',
    icon: LayoutDashboard,
  },
  {
    title: 'Bookings',
    url: '/app/bookings',
    icon: BookOpen,
  },
  {
    title: 'Clients',
    url: '/app/clients',
    icon: Users,
  },
  {
    title: 'Digital studio',
    url: '/app/digital-studio',
    icon: GlobeCode,
  },
  {
    title: 'Insights',
    url: '/app/insights',
    icon: ChartLine,
  },
  {
    title: 'Settings',
    url: '/app/settings',
    icon: Settings,
  },
  {
    title: 'Setup progress',
    url: '/app/setup-progress',
    icon: CircleDashedCheck,
  },
  {
    title: "What's new",
    url: '/app/whats-new',
    icon: Mailbox,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/app'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg border'>
                  K
                </div>

                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    Koyomi
                  </span>

                  <span className='truncate text-xs'>
                    Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
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
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
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