import React from 'react';
import { createPortal } from 'react-dom';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface PaneProps {
  inline: boolean;
  side: 'left' | 'right';
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/** A side pane that renders inline at `lg`+ and inside a sheet below it. */
export function Pane({
  inline,
  side,
  title,
  open,
  onOpenChange,
  children,
}: PaneProps) {
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);

  // Hidden below lg so the server's desktop-first render doesn't flash on tablets.
  if (inline) return <div className="contents max-lg:hidden">{children}</div>;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          showCloseButton={false}
          className="gap-0 data-[side=left]:w-auto data-[side=right]:w-auto"
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <div ref={setHost} className="flex min-h-0 flex-1" />
        </SheetContent>
      </Sheet>
      {/* Portalled from outside the pane's Sheet so sheet triggers inside the
          content still bind to the tab's own sheets. */}
      {host && createPortal(children, host)}
    </>
  );
}
