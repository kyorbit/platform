import { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
            <BreadcrumbSeparator />
            <BreadcrumbItem
              aria-current="page"
              className="text-primary text-lg font-semibold"
            >
              {breadcrumb}
            </BreadcrumbItem>
          </>,
          targets.breadcrumb
        )}
      {targets.actions && createPortal(children, targets.actions)}
    </>
  );
}
