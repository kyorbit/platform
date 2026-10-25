import React from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { List, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useRouterState } from '@tanstack/react-router';
import { AddDivisionDialog } from '../dialogs/add-division-dialog';
import { DivisionSettingsSheet } from '../dialogs/division-settings-sheet';
import { HeaderActions } from '../builder-shell/header-actions';
import { Pane } from '../builder-shell/pane';
import { AddAthletesSheet } from './add-athletes-sheet';
import { AthletePool } from './athlete-pool';
import { DivisionRosterTable } from './division-roster-table';
import { DivisionsRail } from './divisions-rail';
import type { DragEndEvent } from '@dnd-kit/core';
import type { DivisionData } from '@/contracts/tournament/division';
import { useBuilderManagerQuery } from '@/features/dashboard/hooks/use-builder-manager-query';
import { useAssignAthlete } from '@/queries/division';
import { Dialog } from '@/components/ui/dialog';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DivisionsTabProps {
  tournamentId: string;
  tournamentName: string;
  divisions: Array<DivisionData>;
  readOnly: boolean;
}

export function DivisionsTab({
  tournamentId,
  tournamentName,
  divisions,
  readOnly,
}: DivisionsTabProps) {
  const {
    selectedDivisionId,
    setSelectedDivision,
    addAthletes,
    setAddAthletes,
  } = useBuilderManagerQuery();
  const isOnBuilder = useRouterState({
    select: (s) => s.location.pathname.endsWith('/builder'),
  });

  const assignAthlete = useAssignAthlete({ suppressErrorToast: true });

  const [showAddDivision, setShowAddDivision] = React.useState(false);
  const [addAthletesOpen, setAddAthletesOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsDivision, setSettingsDivision] =
    React.useState<DivisionData | null>(null);
  const [poolOpen, setPoolOpen] = React.useState(false);
  const [railOpen, setRailOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const sensors = useSensors(
    // Pool "+" stops pointerdown, not mousedown; the distance keeps its click from dragging.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  React.useEffect(() => {
    // Only write while still on the builder
    if (!isOnBuilder) return;
    if (!selectedDivisionId && divisions.length > 0) {
      void setSelectedDivision(divisions[0]!.id);
    }
  }, [isOnBuilder, selectedDivisionId, divisions, setSelectedDivision]);

  React.useEffect(() => {
    if (readOnly) {
      setShowAddDivision(false);
      setSettingsOpen(false);
      setAddAthletesOpen(false);
    }
  }, [readOnly]);

  React.useEffect(() => {
    if (addAthletes && !readOnly) {
      void setAddAthletes(null);
      setAddAthletesOpen(false);
    }
  }, [addAthletes, readOnly, setAddAthletes, setAddAthletesOpen]);

  const selectedDivision =
    divisions.find((d) => d.id === selectedDivisionId) ?? null;

  const handleDragEnd = (event: DragEndEvent) => {
    const athleteId = event.active.data.current?.athleteId as
      | string
      | undefined;
    const targetDivisionId = event.over?.data.current?.divisionId as
      | string
      | undefined;
    if (!athleteId || !targetDivisionId) return;
    if (event.active.data.current?.fromDivisionId === targetDivisionId) return;
    void toast.promise(
      assignAthlete.mutateAsync({
        divisionId: targetDivisionId,
        tournamentAthleteId: athleteId,
      }),
      {
        loading: 'Adding to division…',
        success: 'Added to division',
        error: (err) =>
          err instanceof Error ? err.message : 'Could not add athlete',
      }
    );
  };

  const prepareSettingsDivision = (division: DivisionData) => {
    setSettingsDivision(division);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (open) setRailOpen(false);
    else setSettingsDivision(null);
  };

  const handleAddAthletesOpenChange = (open: boolean) => {
    setAddAthletesOpen(open);
    if (open) setPoolOpen(false);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {!isDesktop && (
        <HeaderActions>
          <Button variant="outline" size="sm" onClick={() => setPoolOpen(true)}>
            <Users data-icon="inline-start" aria-hidden="true" />
            <span className="max-md:sr-only">Athlete pool</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRailOpen(true)}>
            <List data-icon="inline-start" aria-hidden="true" />
            <span className="max-md:sr-only">Division list</span>
          </Button>
        </HeaderActions>
      )}
      <div className="flex h-full min-h-0 w-full">
        <Sheet
          open={addAthletesOpen}
          onOpenChange={handleAddAthletesOpenChange}
        >
          <Pane
            inline={isDesktop}
            side="left"
            title="Athlete pool"
            open={poolOpen}
            onOpenChange={setPoolOpen}
          >
            <AthletePool
              tournamentId={tournamentId}
              selectedDivisionId={selectedDivisionId}
              readOnly={readOnly}
            />
          </Pane>
          <AddAthletesSheet
            open={addAthletesOpen}
            onOpenChange={setAddAthletesOpen}
            tournamentId={tournamentId}
            tournamentName={tournamentName}
            readOnly={readOnly}
          />
        </Sheet>
        <Sheet
          open={settingsOpen}
          onOpenChange={handleSettingsOpenChange}
          modal={false}
        >
          <DivisionRosterTable
            division={selectedDivision}
            tournamentId={tournamentId}
            divisions={divisions}
            readOnly={readOnly}
            prepareSettingsDivision={prepareSettingsDivision}
          />
          <Pane
            inline={isDesktop}
            side="right"
            title="Division list"
            open={railOpen}
            onOpenChange={setRailOpen}
          >
            <DivisionsRail
              divisions={divisions}
              selectedDivisionId={selectedDivisionId}
              readOnly={readOnly}
              onSelect={(id) => void setSelectedDivision(id)}
              prepareSettingsDivision={prepareSettingsDivision}
              onOpenAddDivision={() => {
                setRailOpen(false);
                setShowAddDivision(true);
              }}
            />
          </Pane>
          <DivisionSettingsSheet
            division={settingsDivision}
            onOpenChange={handleSettingsOpenChange}
          />
        </Sheet>
        <Dialog open={showAddDivision} onOpenChange={setShowAddDivision}>
          <AddDivisionDialog
            key={String(showAddDivision)}
            onOpenChange={setShowAddDivision}
            tournamentId={tournamentId}
          />
        </Dialog>
      </div>
    </DndContext>
  );
}
