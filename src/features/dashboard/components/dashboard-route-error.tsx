import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, HomeIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { FullWidthDivider } from '@/components/ui/full-width-divider';

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === 'NOT_FOUND';
}

function NotFoundShell({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden">
      <div className="flex h-screen items-center border-x">
        <div>
          <FullWidthDivider />
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{title}</EmptyTitle>
              <EmptyDescription className="text-foreground/80">
                {description}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{action}</EmptyContent>
          </Empty>
          <FullWidthDivider />
        </div>
      </div>
    </div>
  );
}

export function TournamentNotFound() {
  return (
    <NotFoundShell
      title="Tournament not found"
      description="This tournament may have been deleted or the link is invalid."
      action={
        <Button
          nativeButton={false}
          render={<Link to="/dashboard/tournaments" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to tournaments
        </Button>
      }
    />
  );
}

function RouteErrorRetry({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const { reset: resetQueries } = useQueryErrorResetBoundary();

  return (
    <div
      role="alert"
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 p-6"
    >
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <AlertCircle className="text-destructive size-8" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium">Something went wrong</p>
          <p className="text-muted-foreground text-sm">
            {error.message || 'Failed to load this page.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              resetQueries();
              reset();
              void router.invalidate();
            }}
          >
            Retry
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/dashboard" />}
          >
            <HomeIcon data-icon="inline-start" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Generic dashboard route errors (home, lists, athletes). */
export function DashboardRouteError(props: ErrorComponentProps) {
  if (isNotFoundError(props.error)) {
    return (
      <NotFoundShell
        title="Not found"
        description={
          props.error.message ||
          "The page you're looking for might have been moved or doesn't exist."
        }
        action={
          <Button nativeButton={false} render={<Link to="/dashboard" />}>
            <HomeIcon data-icon="inline-start" />
            Go to dashboard
          </Button>
        }
      />
    );
  }

  return <RouteErrorRetry {...props} />;
}

/** Tournament detail / builder — NOT_FOUND means missing tournament. */
export function TournamentRouteError(props: ErrorComponentProps) {
  if (isNotFoundError(props.error)) {
    return <TournamentNotFound />;
  }

  return <RouteErrorRetry {...props} />;
}
