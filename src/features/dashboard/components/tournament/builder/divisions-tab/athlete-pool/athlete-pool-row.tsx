import { Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { toast } from 'sonner';
import type { TournamentAthleteData } from '@/contracts/tournament/division';
import { getBeltLabel } from '@/config/athlete';
import { Badge } from '@/components/ui/badge';
import { StatusButton } from '@/components/async/status-button';
import { useStatusButton } from '@/components/async/use-status-button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAssignAthlete } from '@/queries/division';
import { cn } from '@/lib/utils';

interface AthletePoolRowProps {
  athlete: TournamentAthleteData;
  selectedDivisionId: string | null;
  readOnly: boolean;
}

export function AthletePoolRow({
  athlete,
  selectedDivisionId,
  readOnly,
}: AthletePoolRowProps) {
  const assignAthlete = useAssignAthlete({ suppressErrorToast: true });
  const assignButton = useStatusButton(assignAthlete.status);
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: athlete.id,
    data: { type: 'pool-athlete', athleteId: athlete.id },
    disabled: readOnly,
  });

  const canAssign = !!selectedDivisionId && !readOnly;

  const handleAssign = () => {
    if (!canAssign) return;
    void toast.promise(
      assignAthlete.mutateAsync({
        divisionId: selectedDivisionId!,
        tournamentAthleteId: athlete.id,
      }),
      {
        loading: 'Adding to division…',
        success: 'Added to division',
        error: (err) =>
          err instanceof Error ? err.message : 'Could not add athlete',
      }
    );
  };

  const plusButton = (
    <StatusButton
      successLabel={<span className="sr-only">Assigned</span>}
      {...assignButton}
      type="button"
      size="icon"
      variant="ghost"
      className="absolute top-6 right-2 size-7 shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        handleAssign();
      }}
      disabled={!canAssign}
      aria-label="Add athlete to division"
    >
      <Plus className="size-3.5" />
    </StatusButton>
  );

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative flex cursor-grab items-center gap-2 px-3 py-2 pr-10 active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{athlete.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {athlete.affiliation}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {getBeltLabel(athlete.beltLevel)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {athlete.weight}kg
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {athlete.gender}
          </Badge>
        </div>
      </div>

      {canAssign ? (
        plusButton
      ) : (
        <Tooltip>
          <TooltipTrigger render={<span>{plusButton}</span>} />
          <TooltipContent>
            {readOnly ? 'Read-only workspace' : 'Select a division first'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
