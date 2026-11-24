'use client';

import {
  SegmentedControl,
  SegmentedControlItem,
} from '@ui-sdk/react/segmented-control';
import type { BracketCanvasLayout } from '@/lib/tournament/bracket/bracket-layout';
import { bracketConfig } from '@/config/bracket';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type BracketLayoutToggleProps = {
  value: BracketCanvasLayout;
  onChange: (next: BracketCanvasLayout) => void;
};

export function BracketLayoutToggle({
  value,
  onChange,
}: BracketLayoutToggleProps) {
  return (
    <SegmentedControl
      aria-label="Bracket canvas layout"
      value={value}
      onValueChange={(next) => {
        if (next === 'two-sided' || next === 'one-sided') onChange(next);
      }}
      className="bg-muted text-muted-foreground absolute top-2.5 left-2.5 z-10 inline-flex h-10 items-center gap-1 rounded-lg border p-1 shadow-xs"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {bracketConfig.map((layout) => (
        <Tooltip key={layout.value}>
          <TooltipTrigger
            delay={300}
            render={
              <SegmentedControlItem
                value={layout.value}
                aria-label={layout.label}
                className="data-checked:bg-background data-checked:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors data-checked:shadow-xs"
              >
                <layout.icon className="size-4" aria-hidden="true" />
                <span className="sr-only">{layout.label}</span>
              </SegmentedControlItem>
            }
          />
          <TooltipContent
            align="start"
            side="bottom"
            sideOffset={6}
            className="bg-background text-foreground flex max-w-64 flex-col gap-1 border py-2 font-semibold [&>span]:hidden"
          >
            <div className="w-full text-left">{layout.label}</div>
            <p className="text-muted-foreground text-xs text-pretty">
              {layout.description}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </SegmentedControl>
  );
}
