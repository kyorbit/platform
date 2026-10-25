import { Eraser, Plus, RefreshCw, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCustomMatchDialog } from './create-custom-match-dialog';
import type { ReactElement, ReactNode } from 'react';
import { useTournamentBracket } from '@/features/dashboard/contexts/tournament-bracket/use-tournament-bracket';
import {
  useRegenerateBracket,
  useResetBracket,
  useShuffleBracket,
} from '@/queries/match';
import { Button } from '@/components/ui/button';
import { StatusButton } from '@/components/async/status-button';
import { useButtonStatus } from '@/hooks/use-button-status';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { isResettableMatch } from '@/lib/tournament/bracket/bracket-progression';

interface ToolbarState {
  readOnly: boolean;
  divisionId: string | null | undefined;
  matchCount: number;
  status: string;
}

/** Why "Create custom match" is unavailable, or null when it is. */
function customMatchBlock(s: ToolbarState): string | null {
  if (s.readOnly) return 'Read-only mode';
  if (!s.divisionId) return 'Select a division';
  if (s.matchCount === 0) return 'Generate a bracket first';
  if (s.status === 'completed') return 'Tournament completed';
  return null;
}

/** Why shuffle and regenerate are unavailable, or null when they are. */
function bracketBlock(s: ToolbarState): string | null {
  if (s.status !== 'draft') return 'Only available in Draft status';
  if (s.readOnly) return 'Read-only mode';
  if (!s.divisionId) return 'Select a division';
  if (s.matchCount === 0) return 'Generate a bracket first';
  return null;
}

interface ToolProps {
  label: string;
  hint: string;
  reason: string | null;
  icon: ReactNode;
  /** The live control, rendered only when nothing blocks it. */
  children: ReactElement;
}

/**
 * A blocked tool stays pressable (aria-disabled, not disabled) so a touch
 * screen, which has no hover tooltip, can still tell the admin why.
 */
function Tool({ label, hint, reason, icon, children }: ToolProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex">
            {reason === null ? (
              children
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-disabled
                className="rounded-sm opacity-50 hover:bg-transparent"
                onClick={() => toast(reason)}
              >
                {icon}
              </Button>
            )}
          </span>
        }
      />
      <TooltipContent side="right">{reason ?? hint}</TooltipContent>
    </Tooltip>
  );
}

const GROUP_CLASS =
  'bg-popover flex flex-col gap-1 rounded-md border p-1 shadow-md max-sm:flex-row max-sm:border-0 max-sm:p-0 max-sm:shadow-none max-sm:ring-0';

export function BracketToolbar() {
  const {
    selectedDivisionId: divisionId,
    readOnly,
    tournamentStatus,
    matches,
  } = useTournamentBracket();
  const shuffle = useShuffleBracket();
  const regenerate = useRegenerateBracket();
  const reset = useResetBracket();
  const shuffleButton = useButtonStatus(shuffle.status);
  const regenerateButton = useButtonStatus(regenerate.status);
  const resetButton = useButtonStatus(reset.status);

  const state: ToolbarState = {
    readOnly,
    divisionId,
    matchCount: matches.length,
    status: tournamentStatus,
  };
  const customReason = customMatchBlock(state);
  const reason = bracketBlock(state);
  const resetReason =
    reason ??
    (isResettableMatch(matches)
      ? null
      : 'Record a bout or add a custom match to enable reset');

  function wrap<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (e) => (e instanceof Error ? e.message : 'Request failed'),
    });
  }

  return (
    // Below sm it docks along the canvas bottom instead of covering the bracket.
    <div className="max-sm:bg-popover fixed top-1/3 left-3 z-10 -translate-y-1/4 space-y-2 max-sm:absolute max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:flex max-sm:translate-y-0 max-sm:justify-center max-sm:gap-2 max-sm:space-y-0 max-sm:border-t max-sm:p-1">
      <Card className={GROUP_CLASS}>
        <CreateCustomMatchDialog>
          <Tool
            label="Create custom match"
            hint="Custom match"
            reason={customReason}
            icon={<Plus />}
          >
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Create custom match"
                  className="rounded-sm"
                >
                  <Plus />
                </Button>
              }
            />
          </Tool>
        </CreateCustomMatchDialog>
      </Card>
      <Card className={GROUP_CLASS}>
        <Tool
          label="Shuffle bracket"
          hint="Shuffle athletes"
          reason={reason}
          icon={<Shuffle />}
        >
          <StatusButton
            successLabel={<span className="sr-only">Shuffled</span>}
            {...shuffleButton}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Shuffle bracket"
            className="rounded-sm"
            onClick={() => {
              if (!divisionId) return;
              void wrap(shuffle.mutateAsync({ divisionId }), {
                loading: 'Shuffling bracket…',
                success: 'Bracket shuffled',
              });
            }}
          >
            <Shuffle />
          </StatusButton>
        </Tool>

        <Tool
          label="Regenerate bracket"
          hint="Regenerate bracket"
          reason={reason}
          icon={<RefreshCw />}
        >
          <StatusButton
            successLabel={<span className="sr-only">Regenerated</span>}
            {...regenerateButton}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Regenerate bracket"
            onClick={() => {
              if (!divisionId) return;
              void wrap(regenerate.mutateAsync({ divisionId }), {
                loading: 'Regenerating bracket…',
                success: 'Bracket regenerated',
              });
            }}
          >
            <RefreshCw />
          </StatusButton>
        </Tool>

        <Tool
          label="Reset bracket"
          hint="Reset bracket"
          reason={resetReason}
          icon={<Eraser />}
        >
          <StatusButton
            successLabel={<span className="sr-only">Reset</span>}
            {...resetButton}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reset bracket"
            onClick={() => {
              if (!divisionId) return;
              void wrap(reset.mutateAsync({ divisionId }), {
                loading: 'Resetting bracket…',
                success: 'Bracket reset',
              });
            }}
          >
            <Eraser />
          </StatusButton>
        </Tool>
      </Card>
    </div>
  );
}
