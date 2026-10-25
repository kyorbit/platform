import { useMatches } from '@tanstack/react-router';
import { useDashboardHeader } from './dashboard-header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

export const SiteHeader = () => {
  const { setBreadcrumb, setActions } = useDashboardHeader();
  const breadcrumb = useMatches({
    select: (matches) =>
      [...matches]
        .reverse()
        .find((match) => match.staticData.breadcrumb !== undefined)?.staticData
        .breadcrumb ?? 'Dashboard',
  });

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-2" />
      <Separator
        orientation="vertical"
        className="bg-muted-foreground/50 my-auto h-4"
      />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList ref={setBreadcrumb} className="flex-nowrap">
          <BreadcrumbItem className="text-primary mx-1 ml-2 min-w-0 text-lg font-semibold max-sm:not-last:hidden">
            <span className="truncate">{breadcrumb}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div
        ref={setActions}
        className="ml-auto flex shrink-0 items-center gap-2"
      />
    </header>
  );
};
