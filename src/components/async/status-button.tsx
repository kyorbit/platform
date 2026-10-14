'use client';

import { IconCheck } from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Transition, Variants } from 'motion/react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export type ButtonStatus = 'idle' | 'loading' | 'success';
type ButtonClickEvent = Parameters<
  NonNullable<React.ComponentProps<typeof Button>['onClick']>
>[0];

const DEFAULT_SUCCESS_DURATION = 1000;

const swapVariants: Variants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// A spring keeps its velocity when the status changes mid-swap; a cubic-bezier
// would restart from zero.
const swapTransition: Transition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0,
};

// Bounce only on the entrance, and only on movement: opacity and blur would
// overshoot.
const successVariants: Variants = {
  ...swapVariants,
  animate: {
    ...swapVariants.animate,
    transition: {
      type: 'spring',
      duration: 0.45,
      bounce: 0.35,
      opacity: swapTransition,
      filter: swapTransition,
    },
  },
};

export type StatusButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'onClick' | 'children'
> & {
  children: React.ReactNode;
  /**
   * Uncontrolled mode: loading while the returned promise is pending, then
   * success. Omit it when `status` is controlled.
   */
  onClick?: (event: ButtonClickEvent) => void | Promise<void>;
  /** Controlled mode. The parent owns loading and success. */
  status?: ButtonStatus;
  /** Also called for the automatic return to idle after `successDuration`. */
  onStatusChange?: (status: ButtonStatus) => void;
  /** Shown next to the check icon, e.g. "Submitted" for a "Submit" button. */
  successLabel?: React.ReactNode;
  successDuration?: number;
};

export function StatusButton({
  children,
  className,
  onClick,
  status: statusProp,
  onStatusChange,
  successLabel,
  successDuration = DEFAULT_SUCCESS_DURATION,
  ...props
}: StatusButtonProps) {
  const [uncontrolledStatus, setUncontrolledStatus] =
    useState<ButtonStatus>('idle');
  const status = statusProp ?? uncontrolledStatus;
  const setStatus = useCallback(
    (next: ButtonStatus) => {
      if (statusProp === undefined) setUncontrolledStatus(next);
      onStatusChange?.(next);
    },
    [statusProp, onStatusChange]
  );
  const clickInFlight = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (status !== 'success') return;

    const timeoutId = window.setTimeout(
      () => setStatus('idle'),
      successDuration
    );
    return () => window.clearTimeout(timeoutId);
  }, [status, successDuration, setStatus]);

  const isBusy = status !== 'idle';

  const handleClick = async (event: ButtonClickEvent) => {
    if (isBusy || clickInFlight.current) {
      event.preventDefault();
      return;
    }

    if (!onClick) return;

    // Controlled callers set loading and success themselves. Wrapping the
    // click would flash success on a validation return.
    if (statusProp !== undefined) {
      clickInFlight.current = true;
      try {
        await onClick(event);
      } finally {
        clickInFlight.current = false;
      }
      return;
    }

    setStatus('loading');
    clickInFlight.current = true;

    try {
      await onClick(event);
      setStatus('success');
    } catch (error) {
      setStatus('idle');
      throw error;
    } finally {
      clickInFlight.current = false;
    }
  };

  const variants = shouldReduceMotion ? reducedMotionVariants : swapVariants;
  const transition = shouldReduceMotion ? { duration: 0 } : swapTransition;

  const successContent = (
    <>
      <IconCheck />
      {successLabel ?? <span className="sr-only">Success</span>}
    </>
  );

  return (
    <Button
      data-status={status}
      aria-busy={status === 'loading'}
      // Not `disabled`: busy keeps focus and the normal look, and the click
      // handler ignores presses meanwhile.
      aria-disabled={isBusy || undefined}
      onClick={handleClick}
      className={cn(
        'inline-grid justify-items-center *:col-start-1 *:row-start-1 *:flex *:items-center *:gap-[inherit]',
        className
      )}
      {...props}
    >
      {/* Invisible copies of the widest states keep the button's width fixed. */}
      <span aria-hidden className="invisible">
        {children}
      </span>
      <span aria-hidden className="invisible">
        {successContent}
      </span>

      <AnimatePresence initial={false}>
        {status === 'idle' && (
          <motion.span
            key="idle"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            {children}
          </motion.span>
        )}

        {status === 'loading' && (
          <motion.span
            key="loading"
            role="status"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <Spinner />
            <span className="sr-only">Loading</span>
          </motion.span>
        )}

        {status === 'success' && (
          <motion.span
            key="success"
            role="status"
            variants={shouldReduceMotion ? variants : successVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            {successContent}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
