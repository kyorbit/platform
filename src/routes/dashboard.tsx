import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AppSidebar } from '@/features/dashboard/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import LoadingScreen from '@/components/navigation/loading';
import { requireSession } from '@/queries/session';
import { ThemeProvider } from '@/contexts/themes';
import { Toaster } from '@/components/ui/sonner';
import { DashboardHeaderProvider } from '@/features/dashboard/components/sidebar/dashboard-header';
import { SiteHeader } from '@/features/dashboard/components/sidebar/site-header';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context: { queryClient } }) => requireSession(queryClient),
  pendingComponent: () => <LoadingScreen title="Loading your dashboard..." />,
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="start-theme">
      <div className="overflow-hidden">
        <SidebarProvider className="relative h-svh">
          <AppSidebar />
          <SidebarInset>
            <DashboardHeaderProvider>
              <SiteHeader />
              <div className="min-h-0 flex-1 overflow-hidden">
                <Outlet />
              </div>
            </DashboardHeaderProvider>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
