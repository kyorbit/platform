import { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: ReactNode;
  }
}

const DashboardHeaderContext = createContext<{
  breadcrumb: HTMLOListElement | null;
  actions: HTMLDivElement | null;
  setBreadcrumb: (element: HTMLOListElement | null) => void;
  setActions: (element: HTMLDivElement | null) => void;
} | null>(null);

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<HTMLOListElement | null>(null);
  const [actions, setActions] = useState<HTMLDivElement | null>(null);
  const value = useMemo(
    () => ({ breadcrumb, actions, setBreadcrumb, setActions }),
    [breadcrumb, actions]
  );

  return (
    <DashboardHeaderContext value={value}>{children}</DashboardHeaderContext>
  );
}

export function useDashboardHeader() {
  const context = useContext(DashboardHeaderContext);
  if (!context) {
    throw new Error('Dashboard header requires DashboardHeaderProvider');
  }
  return context;
}

export function DashboardHeaderContent({
  breadcrumb,
  children,
}: {
  breadcrumb?: ReactNode;
  children?: ReactNode;
}) {
  const targets = useDashboardHeader();

  return (
    <>
      {targets.breadcrumb &&
        breadcrumb &&
        createPortal(
          <>
            <BreadcrumbSeparator className="max-sm:hidden" />
            <BreadcrumbItem
              aria-current="page"
              className="text-primary min-w-0 text-lg font-semibold"
            >
              <span className="truncate">{breadcrumb}</span>
            </BreadcrumbItem>
          </>,
          targets.breadcrumb
        )}
      {targets.actions && createPortal(children, targets.actions)}
    </>
  );
}

export interface HeaderAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  render?: ReactElement;
}

/** Secondary page actions: inline buttons from `sm`, a "⋯" menu below it. */
export function HeaderActions({ actions }: { actions: Array<HeaderAction> }) {
  return (
    <>
      <div className="hidden sm:contents">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            nativeButton={!action.render}
            render={action.render}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              className="sm:hidden"
              aria-label="More actions"
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-fit">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              render={action.render}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
