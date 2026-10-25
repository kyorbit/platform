import React from 'react';
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

function DisabledWhenReadOnly({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: React.ReactElement;
}) {
  if (!readOnly) return children;
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="inline-flex">{children}</span>}
      />
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

  return (
    <TooltipProvider delay={200}>
      <footer className="bg-sidebar/70 supports-backdrop-filter:bg-sidebar/50 flex h-12 items-center gap-2 border-t px-4">
        <div className="flex items-center gap-2">
          <StatusButton
            successLabel="Refreshed"
            variant="ghost"
            size="sm"
            onClick={() => onRefresh?.()}
            className="gap-2"
          >
            <RefreshCw />
            <span>Refresh</span>
          </StatusButton>

          <div className="contents max-lg:hidden">
            <DisabledWhenReadOnly readOnly={readOnly}>
              <Button
                variant="ghost"
                size="sm"
                disabled={readOnly}
                onClick={() => onAutoAssignAll?.()}
                className="gap-2"
              >
                <Zap className="size-4" />
                <span>Auto-assign all</span>
              </Button>
            </DisabledWhenReadOnly>
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto lg:hidden"
                aria-label="More actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" side="top" className="w-48">
            <DropdownMenuItem
              disabled={readOnly}
              onClick={() => onAutoAssignAll?.()}
            >
              <Zap />
              Auto-assign all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onActivity}>
              <History />
              Activity
            </DropdownMenuItem>
            <DropdownMenuItem disabled={readOnly} onClick={onEditTournament}>
              <Settings />
              Edit Tournament
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={readOnly}
              onClick={onDeleteTournament}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link
                  to="/dashboard/tournaments/$id"
                  params={{ id: tournament.id }}
                  search={{}}
                />
              }
            >
              <ArrowLeft />
              Command Center
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1 max-lg:hidden">
          <Button variant="ghost" size="sm" type="button" onClick={onActivity}>
            <History className="mr-1 size-4" />
            Activity
          </Button>
          <DisabledWhenReadOnly readOnly={readOnly}>
            <Button
              variant="ghost"
              size="sm"
              disabled={readOnly}
              onClick={onEditTournament}
              className="gap-2"
            >
              <Settings className="size-4" />
              <span>Edit Tournament</span>
            </Button>
          </DisabledWhenReadOnly>

          <DisabledWhenReadOnly readOnly={readOnly}>
            <Button
              variant="ghost"
              size="sm"
              disabled={readOnly}
              onClick={onDeleteTournament}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
            </Button>
          </DisabledWhenReadOnly>

          <Separator orientation="vertical" className="mx-2 my-auto h-6" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            nativeButton={false}
            render={
              <Link
                to="/dashboard/tournaments/$id"
                params={{ id: tournament.id }}
                search={{}}
              />
            }
          >
            <ArrowLeft className="size-4" />
            <span>Command Center</span>
          </Button>
        </div>
      </footer>
    </TooltipProvider>
  );
}
