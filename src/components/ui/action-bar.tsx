import {
  DirectionProvider,
  useDirection,
} from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { useAsRef } from '@/hooks/use-as-ref';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';
import { useComposedRefs } from '@/lib/compose-refs';
import { cn } from '@/lib/utils';

const ROOT_NAME = 'ActionBar';
const GROUP_NAME = 'ActionBarGroup';
const ITEM_NAME = 'ActionBarItem';
const CLOSE_NAME = 'ActionBarClose';
const SEPARATOR_NAME = 'ActionBarSeparator';
const ITEM_SELECT = 'actionbar.itemSelect';
const ENTRY_FOCUS = 'actionbarFocusGroup.onEntryFocus';
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type Direction = 'ltr' | 'rtl';
type Orientation = 'horizontal' | 'vertical';

type DivProps = useRender.ComponentProps<'div'>;

type RootElement = React.ComponentRef<typeof ActionBar>;
type ItemElement = React.ComponentRef<typeof ActionBarItem>;

function focusFirst(
  candidates: Array<React.RefObject<HTMLElement | null>>,
  preventScroll = false
) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function wrapArray<T>(array: Array<T>, startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T
  );
}

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== 'rtl') return key;
  return key === 'ArrowLeft'
    ? 'ArrowRight'
    : key === 'ArrowRight'
      ? 'ArrowLeft'
      : key;
}

interface ItemData {
  id: string;
  ref: React.RefObject<ItemElement | null>;
  disabled: boolean;
}

interface ActionBarContextValue {
  onOpenChange?: (open: boolean) => void;
  dir: Direction;
  orientation: Orientation;
  loop: boolean;
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(
  null
);

function useActionBarContext(consumerName: string) {
  const context = React.useContext(ActionBarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FocusContextValue {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => Array<ItemData>;
}

const FocusContext = React.createContext<FocusContextValue | null>(null);

function useFocusContext(consumerName: string) {
  const context = React.useContext(FocusContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`FocusProvider\``
    );
  }
  return context;
}

interface ActionBarProps extends DivProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  side?: 'top' | 'bottom';
  sideOffset?: number;
  portalContainer?: Element | DocumentFragment | null;
  dir?: Direction;
  orientation?: Orientation;
  loop?: boolean;
}

function ActionBar(props: ActionBarProps) {
  const {
    open = false,
    onOpenChange,
    onEscapeKeyDown,
    side = 'bottom',
    alignOffset = 0,
    align = 'center',
    sideOffset = 16,
    portalContainer: portalContainerProp,
    dir: dirProp,
    orientation = 'horizontal',
    loop = true,
    className,
    style,
    ref,
    render,
    ...rootProps
  } = props;

  const [mounted, setMounted] = React.useState(false);

  const rootRef = React.useRef<RootElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  const propsRef = useAsRef({
    onEscapeKeyDown,
    onOpenChange,
  });

  const inheritedDirection = useDirection();
  const dir = dirProp ?? inheritedDirection;

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const ownerDocument = rootRef.current?.ownerDocument ?? document;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        propsRef.current.onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) {
          propsRef.current.onOpenChange?.(false);
        }
      }
    }

    ownerDocument.addEventListener('keydown', onKeyDown);
    return () => ownerDocument.removeEventListener('keydown', onKeyDown);
  }, [open, propsRef]);

  const contextValue = React.useMemo<ActionBarContextValue>(
    () => ({
      onOpenChange,
      dir,
      orientation,
      loop,
    }),
    [onOpenChange, dir, orientation, loop]
  );

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: composedRef,
    state: {
      slot: 'action-bar',
      side: side,
      align: align,
      orientation: orientation,
    },
    props: mergeProps<'div'>(
      { role: 'toolbar', 'aria-orientation': orientation, dir: dir },
      rootProps,
      {
        className: cn(
          'bg-card fixed z-50 rounded-lg border shadow-lg outline-none',
          'fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          'data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4',
          'motion-reduce:animate-none motion-reduce:transition-none',
          orientation === 'horizontal'
            ? 'flex flex-row items-center gap-2 px-2 py-1.5'
            : 'flex flex-col items-start gap-2 px-1.5 py-2',
          className
        ),
        style: {
          [side]: `${sideOffset}px`,
          ...(align === 'center' && {
            left: '50%',
            translate: '-50% 0',
          }),
          ...(align === 'start' && { left: `${alignOffset}px` }),
          ...(align === 'end' && { right: `${alignOffset}px` }),
          ...style,
        },
      }
    ),
  });
  if (!portalContainer || !open) return null;
  return (
    <DirectionProvider direction={dir}>
      <ActionBarContext.Provider value={contextValue}>
        {ReactDOM.createPortal(element, portalContainer)}
      </ActionBarContext.Provider>
    </DirectionProvider>
  );
}

function ActionBarSelection(props: DivProps) {
  const { className, render, ...selectionProps } = props;

  const element = useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'action-bar-selection' },
    props: mergeProps<'div'>(selectionProps, {
      className: cn(
        'flex items-center gap-1 rounded-sm border px-2 py-1 text-sm font-medium tabular-nums',
        className
      ),
    }),
  });
  return element;
}

function ActionBarGroup(props: DivProps) {
  const {
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onMouseDown: onMouseDownProp,
    className,
    render,
    ref,
    ...groupProps
  } = props;

  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const [focusableItemCount, setFocusableItemCount] = React.useState(0);

  const groupRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, groupRef);
  const isClickFocusRef = React.useRef(false);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());

  const { dir, orientation } = useActionBarContext(GROUP_NAME);

  const onItemFocus = React.useCallback((id: string) => {
    setTabStopId(id);
  }, []);

  const onItemShiftTab = React.useCallback(() => {
    setIsTabbingBackOut(true);
  }, []);

  const onFocusableItemAdd = React.useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount + 1);
  }, []);

  const onFocusableItemRemove = React.useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount - 1);
  }, []);

  const onItemRegister = React.useCallback((item: ItemData) => {
    itemsRef.current.set(item.id, item);
  }, []);

  const onItemUnregister = React.useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = React.useCallback(() => {
    return Array.from(itemsRef.current.values())
      .filter((item) => item.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, []);

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;

      setIsTabbingBackOut(false);
    },
    [onBlurProp]
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      const isKeyboardFocus = !isClickFocusRef.current;
      if (
        event.target === event.currentTarget &&
        isKeyboardFocus &&
        !isTabbingBackOut
      ) {
        const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
        event.currentTarget.dispatchEvent(entryFocusEvent);

        if (!entryFocusEvent.defaultPrevented) {
          const items = Array.from(itemsRef.current.values()).filter(
            (item) => !item.disabled
          );
          const currentItem = items.find((item) => item.id === tabStopId);

          const candidateItems = [currentItem, ...items].filter(
            Boolean
          ) as Array<ItemData>;
          const candidateRefs = candidateItems.map((item) => item.ref);
          focusFirst(candidateRefs, false);
        }
      }
      isClickFocusRef.current = false;
    },
    [onFocusProp, isTabbingBackOut, tabStopId]
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;

      isClickFocusRef.current = true;
    },
    [onMouseDownProp]
  );

  const focusContextValue = React.useMemo<FocusContextValue>(
    () => ({
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    }),
    [
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    ]
  );

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: composedRef,
    state: { slot: 'action-bar-group', orientation: orientation },
    props: mergeProps<'div'>(
      {
        role: 'group',
        dir: dir,
        tabIndex: isTabbingBackOut || focusableItemCount === 0 ? -1 : 0,
      },
      groupProps,
      {
        className: cn(
          'flex gap-2 outline-none',
          orientation === 'horizontal'
            ? 'items-center'
            : 'w-full flex-col items-start',
          className
        ),
        onBlur: onBlur,
        onFocus: onFocus,
        onMouseDown: onMouseDown,
      }
    ),
  });
  return (
    <FocusContext.Provider value={focusContextValue}>
      {element}
    </FocusContext.Provider>
  );
}

type ActionBarButtonProps = React.ComponentProps<typeof Button>;
type ActionBarButtonEvent<
  K extends 'onClick' | 'onFocus' | 'onKeyDown' | 'onMouseDown',
> = Parameters<NonNullable<ActionBarButtonProps[K]>>[0];

interface ActionBarItemProps extends Omit<ActionBarButtonProps, 'onSelect'> {
  onSelect?: (event: Event) => void;
}

function ActionBarItem(props: ActionBarItemProps) {
  const {
    onSelect,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    className,
    disabled,
    ref,
    ...itemProps
  } = props;

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const isMouseClickRef = React.useRef(false);

  const { onOpenChange, dir, orientation, loop } =
    useActionBarContext(ITEM_NAME);
  const focusContext = useFocusContext(ITEM_NAME);

  const itemId = React.useId();
  const isTabStop = focusContext.tabStopId === itemId;

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: itemId,
      ref: itemRef,
      disabled: !!disabled,
    });

    if (!disabled) {
      focusContext.onFocusableItemAdd();
    }

    return () => {
      focusContext.onItemUnregister(itemId);
      if (!disabled) {
        focusContext.onFocusableItemRemove();
      }
    };
  }, [focusContext, itemId, disabled]);

  const onClick = React.useCallback(
    (event: ActionBarButtonEvent<'onClick'>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      const item = itemRef.current;
      if (!item) return;

      const itemSelectEvent = new CustomEvent(ITEM_SELECT, {
        bubbles: true,
        cancelable: true,
      });

      item.addEventListener(
        ITEM_SELECT,
        (selectEvent) => onSelect?.(selectEvent),
        {
          once: true,
        }
      );

      item.dispatchEvent(itemSelectEvent);

      if (!itemSelectEvent.defaultPrevented) {
        onOpenChange?.(false);
      }
    },
    [onClickProp, onOpenChange, onSelect]
  );

  const onFocus = React.useCallback(
    (event: ActionBarButtonEvent<'onFocus'>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(itemId);
      isMouseClickRef.current = false;
    },
    [onFocusProp, focusContext, itemId]
  );

  const onKeyDown = React.useCallback(
    (event: ActionBarButtonEvent<'onKeyDown'>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (event.key === 'Tab' && event.shiftKey) {
        focusContext.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) return;

      const key = getDirectionAwareKey(event.key, dir);
      let focusIntent: 'first' | 'last' | 'prev' | 'next' | undefined;

      if (orientation === 'horizontal') {
        if (key === 'ArrowLeft') focusIntent = 'prev';
        else if (key === 'ArrowRight') focusIntent = 'next';
        else if (key === 'Home') focusIntent = 'first';
        else if (key === 'End') focusIntent = 'last';
      } else {
        if (key === 'ArrowUp') focusIntent = 'prev';
        else if (key === 'ArrowDown') focusIntent = 'next';
        else if (key === 'Home') focusIntent = 'first';
        else if (key === 'End') focusIntent = 'last';
      }

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
          return;
        event.preventDefault();

        const items = focusContext.getItems().filter((item) => !item.disabled);
        let candidateRefs = items.map((item) => item.ref);

        if (focusIntent === 'last') {
          candidateRefs.reverse();
        } else if (focusIntent === 'prev' || focusIntent === 'next') {
          if (focusIntent === 'prev') candidateRefs.reverse();
          const currentIndex = candidateRefs.findIndex(
            (candidateRef) => candidateRef.current === event.currentTarget
          );
          candidateRefs = loop
            ? wrapArray(candidateRefs, currentIndex + 1)
            : candidateRefs.slice(currentIndex + 1);
        }

        queueMicrotask(() => focusFirst(candidateRefs));
      }
    },
    [onKeyDownProp, focusContext, dir, orientation, loop]
  );

  const onMouseDown = React.useCallback(
    (event: ActionBarButtonEvent<'onMouseDown'>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;

      isMouseClickRef.current = true;

      if (disabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(itemId);
      }
    },
    [onMouseDownProp, focusContext, itemId, disabled]
  );

  return (
    <Button
      type="button"
      data-slot="action-bar-item"
      variant="secondary"
      size="sm"
      disabled={disabled}
      tabIndex={isTabStop ? 0 : -1}
      {...itemProps}
      className={cn(orientation === 'vertical' && 'w-full', className)}
      ref={composedRef}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
    />
  );
}

type ActionBarCloseProps = useRender.ComponentProps<'button'>;

function ActionBarClose(props: ActionBarCloseProps) {
  const { render, className, onClick, ...closeProps } = props;

  const { onOpenChange } = useActionBarContext(CLOSE_NAME);

  const onCloseClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      onOpenChange?.(false);
    },
    [onOpenChange, onClick]
  );

  const element = useRender({
    defaultTagName: 'button',
    render,
    state: { slot: 'action-bar-close' },
    props: mergeProps<'button'>({ type: 'button' }, closeProps, {
      className: cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 rounded-xs opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      ),
      onClick: onCloseClick,
    }),
  });
  return element;
}

interface ActionBarSeparatorProps extends DivProps {
  orientation?: Orientation;
}

function ActionBarSeparator(props: ActionBarSeparatorProps) {
  const {
    orientation: orientationProp,
    render,
    className,
    ...separatorProps
  } = props;

  const context = useActionBarContext(SEPARATOR_NAME);
  const orientation = orientationProp ?? context.orientation;

  const element = useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'action-bar-separator' },
    props: mergeProps<'div'>(
      {
        role: 'separator',
        'aria-orientation': orientation,
        'aria-hidden': 'true',
      },
      separatorProps,
      {
        className: cn(
          'bg-border in-data-[slot=action-bar-selection]:ml-0.5 in-data-[slot=action-bar-selection]:h-4 in-data-[slot=action-bar-selection]:w-px',
          orientation === 'horizontal' ? 'h-6 w-px' : 'h-px w-full',
          className
        ),
      }
    ),
  });
  return element;
}

export {
  ActionBar,
  ActionBarSelection,
  ActionBarGroup,
  ActionBarItem,
  ActionBarClose,
  ActionBarSeparator,
  type ActionBarProps,
};
