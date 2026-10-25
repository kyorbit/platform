import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

const BuilderFooterContext = createContext<{
  host: HTMLDivElement | null;
  setHost: (element: HTMLDivElement | null) => void;
} | null>(null);

function useBuilderFooter() {
  const context = useContext(BuilderFooterContext);
  if (!context) {
    throw new Error('Builder footer requires BuilderFooterProvider');
  }
  return context;
}

export function BuilderFooterProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <BuilderFooterContext value={{ host, setHost }}>
      {children}
    </BuilderFooterContext>
  );
}

/** Where the Builder footer shows tab-specific buttons. */
export function BuilderFooterSlot() {
  const { setHost } = useBuilderFooter();
  return <div ref={setHost} className="flex items-center gap-1 empty:hidden" />;
}

/** Renders a tab's buttons into the Builder footer. */
export function BuilderFooterPortal({ children }: { children: ReactNode }) {
  const { host } = useBuilderFooter();
  return host ? createPortal(children, host) : null;
}
