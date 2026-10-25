import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  History,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react';
import { BuilderFooterSlot } from './footer-portal';
import type { LucideIcon } from 'lucide-react';
import type {
  TournamentData,
  TournamentStatus,
} from '@/contracts/tournament/list';
import { TOURNAMENT_STATUSES } from '@/contracts/tournament/list';
import { Button } from '@/components/ui/button';
import { StatusButton } from '@/components/async/status-button';
import { Separator } from '@/components/ui/separator';
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
  tournament: TournamentData;
  readOnly: boolean;
  isSettingTournamentStatus?: boolean;
  onRefresh?: () => void | Promise<void>;
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
  onRefresh,
  onAutoAssignAll,
  onAdminStatusIntent,
  onEditTournament,
  onDeleteTournament,
  onActivity,
}: BuilderFooterProps) {
  const status = tournament.status;

  const autoAssign: FooterAction = {
    label: 'Auto-assign all',
    icon: Zap,
    onClick: () => onAutoAssignAll?.(),
    disabled: readOnly,
  };
  const manageActions: Array<FooterAction> = [
    { label: 'Activity', icon: History, onClick: onActivity },
    {
      label: 'Edit Tournament',
      icon: Settings,
      onClick: onEditTournament,
      disabled: readOnly,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDeleteTournament,
      disabled: readOnly,
      variant: 'destructive',
    },
  ];
  const commandCenterLink = (
    <Link
      to="/dashboard/tournaments/$id"
      params={{ id: tournament.id }}
      search={{}}
    />
  );

  return (
    <TooltipProvider delay={200}>
      <footer className="bg-sidebar/70 supports-backdrop-filter:bg-sidebar/50 flex h-12 items-center gap-2 border-t px-4">
        <div className="flex items-center gap-2">
          <StatusButton
            successLabel={<span className="max-sm:sr-only">Refreshed</span>}
            variant="ghost"
            size="sm"
            onClick={() => onRefresh?.()}
            className="gap-2"
          >
            <RefreshCw />
            <span className="max-sm:sr-only">Refresh</span>
          </StatusButton>

          <div className="contents max-lg:hidden">
            <InlineAction action={autoAssign} />
          </div>

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
            <SelectTrigger size="sm" className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

        <Separator
          orientation="vertical"
          className="mx-2 my-auto h-6 max-lg:hidden"
        />

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
              {[autoAssign, ...manageActions].map((action) => (
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
              <DropdownMenuItem render={commandCenterLink}>
                <ArrowLeft />
                Command Center
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <BuilderFooterSlot />
        </div>

        <div className="ml-auto flex items-center gap-1 max-lg:hidden">
          {manageActions.map((action) => (
            <InlineAction key={action.label} action={action} />
          ))}

          <Separator orientation="vertical" className="mx-2 my-auto h-6" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            nativeButton={false}
            render={commandCenterLink}
          >
            <ArrowLeft className="size-4" />
            <span>Command Center</span>
          </Button>
        </div>
      </footer>
    </TooltipProvider>
  );
}
