import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  History,
  MoreHorizontal,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { BuilderFooterSlot } from './footer-portal';
import type { LucideIcon } from 'lucide-react';
import type {
  TournamentDetail,
  TournamentStatus,
} from '@/contracts/tournaments/dto';
import { TOURNAMENT_STATUSES } from '@/contracts/tournaments/dto';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BuilderFooterProps {
  tournament: TournamentDetail;
  readOnly: boolean;
  isSettingTournamentStatus?: boolean;
  onAutoAssignAll?: () => void;
  onAdminStatusIntent: (next: TournamentStatus) => void;
  onEditTournament: () => void;
  onDeleteTournament: () => void;
  onActivity: () => void;
}

/** A secondary action: an inline button from `lg`, a menu item below it. */
interface FooterAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'destructive';
}

function InlineAction({ action }: { action: FooterAction }) {
  const button = (
    <Button
      variant="ghost"
      size="sm"
      disabled={action.disabled}
      onClick={action.onClick}
      className={cn(
        'gap-2',
        action.variant === 'destructive' &&
          'text-destructive hover:bg-destructive/10 hover:text-destructive'
      )}
    >
      <action.icon className="size-4" />
      <span>{action.label}</span>
    </Button>
  );
  if (!action.disabled) return button;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex">{button}</span>} />
      <TooltipContent>Tournament completed</TooltipContent>
    </Tooltip>
  );
}

const STATUS_LABEL: Record<TournamentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

export function BuilderFooter({
  tournament,
  readOnly,
  isSettingTournamentStatus,
  onAutoAssignAll,
  onAdminStatusIntent,
  onEditTournament,
  onDeleteTournament,
  onActivity,
}: BuilderFooterProps) {
  const status = tournament.status;

  const manageActions: Array<FooterAction> = [
    { label: 'Activity', icon: History, onClick: onActivity },
    {
      label: 'Auto-assign',
      icon: Zap,
      onClick: () => onAutoAssignAll?.(),
      disabled: readOnly,
    },
    {
      label: 'Edit Tournament',
      icon: Settings,
      onClick: onEditTournament,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDeleteTournament,
      variant: 'destructive',
    },
  ];

  const commandCenterLink = useMemo(
    () => (
      <Link
        to="/dashboard/tournaments/$id"
        params={{ id: tournament.id }}
        search={{}}
      />
    ),
    [tournament.id]
  );

  return (
    <TooltipProvider delay={200}>
      <footer className="bg-sidebar/70 supports-backdrop-filter:bg-sidebar/50 flex h-12 items-center gap-2 border-t px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 max-sm:size-8"
            nativeButton={false}
            render={commandCenterLink}
          >
            <ArrowLeft data-icon="inline-start" className="size-4" />
            <span className="max-md:hidden">Command Center</span>
          </Button>

          <Select
            items={TOURNAMENT_STATUSES.map((s) => ({
              value: s,
              label: STATUS_LABEL[s],
            }))}
            value={status}
            disabled={Boolean(isSettingTournamentStatus)}
            onValueChange={(v) => {
              if (v === null) return;
              onAdminStatusIntent(v as TournamentStatus);
            }}
          >
            <SelectTrigger size="sm" className="w-28 sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-28">
              <SelectGroup>
                {TOURNAMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" side="top" className="w-48">
              {manageActions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  variant={action.variant}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  <action.icon />
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
          <BuilderFooterSlot />
        </div>

        <div className="ml-auto flex items-center gap-1 max-lg:hidden">
          {manageActions.map((action) => (
            <InlineAction key={action.label} action={action} />
          ))}
        </div>
      </footer>
    </TooltipProvider>
  );
}
