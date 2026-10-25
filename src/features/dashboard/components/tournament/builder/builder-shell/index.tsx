import React from 'react';
import { PanelsTopLeft } from 'lucide-react';
import { EdgeReveal } from './edge-reveal';
import { BuilderFooterProvider } from './footer-portal';
import { useBracketChrome } from '@/features/dashboard/contexts/bracket-chrome';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuilderShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  readOnly?: boolean;
}

export function BuilderShell({
  header,
  children,
  footer,
  readOnly,
}: BuilderShellProps) {
  const { isFullscreen, chromeOpen, toggleChrome } = useBracketChrome();

  return (
    <BuilderFooterProvider>
      <div
        className={cn('flex h-dvh flex-col', isFullscreen && 'overflow-hidden')}
        data-bracket-fullscreen={isFullscreen || undefined}
      >
        {isFullscreen ? <EdgeReveal edge="top">{header}</EdgeReveal> : header}
        {readOnly && !isFullscreen && (
          <Alert
            variant="warning"
            className="fixed top-16 left-1/2 z-20 w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2 border-amber-500/20 bg-amber-500/10 backdrop-blur-sm"
          >
            <AlertTitle className="text-center">Read-only workspace</AlertTitle>
            <AlertDescription className="text-center">
              This tournament is completed. Features are disabled so results
              stay locked.
            </AlertDescription>
          </Alert>
        )}
        <main
          className={cn(
            'relative flex flex-1 overflow-hidden',
            isFullscreen && 'fixed inset-0 z-50'
          )}
        >
          {children}
        </main>
        {isFullscreen ? (
          <EdgeReveal edge="bottom">{footer}</EdgeReveal>
        ) : (
          footer
        )}
        {isFullscreen && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={chromeOpen ? 'Hide controls' : 'Show controls'}
            aria-pressed={chromeOpen}
            onClick={toggleChrome}
            className="bg-background/90 fixed bottom-16 left-3 z-[70] hidden shadow-md backdrop-blur-sm pointer-coarse:inline-flex"
          >
            <PanelsTopLeft />
          </Button>
        )}
      </div>
    </BuilderFooterProvider>
  );
}
