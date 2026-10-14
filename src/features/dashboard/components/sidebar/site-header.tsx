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
      <Breadcrumb>
        <BreadcrumbList ref={setBreadcrumb}>
          <BreadcrumbItem className="text-primary mx-1 ml-2 text-lg font-semibold">
            {breadcrumb}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div ref={setActions} className="ml-auto flex items-center gap-2" />
    </header>
  );
};
