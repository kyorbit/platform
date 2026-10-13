import { useQueryState } from 'nuqs';
import React from 'react';

import { FeatureFlagsContext } from './context';
import type { FeatureFlagsContextValue, FilterFlag } from './context';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { flagConfig } from '@/config/flag';

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    'filterFlag',
    {
      parse: (value) => {
        if (!value) return null;
        const validValues = flagConfig.featureFlags.map((flag) => flag.value);
        return validValues.includes(value as FilterFlag)
          ? (value as FilterFlag)
          : null;
      },
      serialize: (value) => value ?? '',
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    }
  );

  const onFilterFlagChange = React.useCallback(
    (value: FilterFlag) => {
      setFilterFlag(value);
    },
    [setFilterFlag]
  );

  const contextValue = React.useMemo<FeatureFlagsContextValue>(
    () => ({
      filterFlag,
      enableAdvancedFilter:
        filterFlag === 'advancedFilters' || filterFlag === 'commandFilters',
    }),
    [filterFlag]
  );

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      <div className="w-full overflow-x-auto p-1">
        <ToggleGroup
          variant="outline"
          size="sm"
          value={filterFlag ? [filterFlag] : []}
          onValueChange={(next) => {
            const selected = flagConfig.featureFlags.find(
              (flag) => flag.value === next[0]
            );
            if (selected) {
              onFilterFlagChange(selected.value);
            } else {
              void setFilterFlag(null);
            }
          }}
          className="w-fit gap-0"
        >
          {flagConfig.featureFlags.map((flag) => (
            <Tooltip key={flag.value}>
              <ToggleGroupItem
                value={flag.value}
                className="data-pressed:bg-accent/70 data-pressed:hover:bg-accent/90 px-3 text-xs whitespace-nowrap"
                render={<TooltipTrigger delay={700} />}
              >
                <flag.icon className="size-3.5 shrink-0" />
                {flag.label}
              </ToggleGroupItem>
              <TooltipContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="bg-background text-foreground flex flex-col gap-1.5 border py-2 font-semibold [&>span]:hidden"
              >
                <div>{flag.tooltipTitle}</div>
                <p className="text-muted-foreground text-xs text-balance">
                  {flag.tooltipDescription}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
