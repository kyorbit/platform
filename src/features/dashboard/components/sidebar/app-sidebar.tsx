import React from 'react';
import { Link } from '@tanstack/react-router';
import { NavSecondary } from './nav-secondary';
import { NavDocuments } from './nav-documents';
import { NavMain } from './nav-main';
import { BrandIcon } from '@/components/ui/brand';
import { UserNav } from '@/components/user/user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navDocuments, navMain, navSecondary } from '@/config/sidebar-nav';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/dashboard">
                  <BrandIcon className="size-8!" />
                  <span className="truncate text-2xl font-semibold">
                    Kyorbit
                  </span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={navDocuments} />
        <NavSecondary
          items={navSecondary}
          className="absolute bottom-16 pr-16 transition-all duration-200 group-data-[collapsible=icon]:bottom-12"
        />
      </SidebarContent>

      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
