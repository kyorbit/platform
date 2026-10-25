import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

const HeaderActionsContext = createContext<{
  host: HTMLDivElement | null;
  setHost: (element: HTMLDivElement | null) => void;
} | null>(null);

function useHeaderActions() {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error('Header actions require HeaderActionsProvider');
  }
  return context;
}

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <HeaderActionsContext value={{ host, setHost }}>
      {children}
    </HeaderActionsContext>
  );
}

/** Where the Builder header shows tab-specific buttons. */
export function HeaderActionsSlot() {
  const { setHost } = useHeaderActions();
  return <div ref={setHost} className="flex items-center gap-1 empty:hidden" />;
}

/** Renders a tab's buttons into the Builder header. */
export function HeaderActions({ children }: { children: ReactNode }) {
  const { host } = useHeaderActions();
  return host ? createPortal(children, host) : null;
}
