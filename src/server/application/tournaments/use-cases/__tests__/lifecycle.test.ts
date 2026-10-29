import { describe, expect, it } from 'vitest';

import {
  createTournament,
  deleteTournament,
  setTournamentStatus,
  updateTournament,
} from '../lifecycle';
import type { TournamentLifecycleStore } from '../../repositories/lifecycle';
import {
  BadRequestError,
  NotFoundError,
  PolicyViolationError,
} from '@/server/application/errors';

const baseLifecycle = {
  id: 'tournament-1',
  status: 'draft',
  lifecycle: { canComplete: false },
};

const baseRow = {
  id: 'tournament-1',
  name: 'Spring Open',
  status: 'draft' as const,
  nameSortKey: 'spring open',
  arenaDivisionOrder: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function fakeStore(
  lifecycle: typeof baseLifecycle | null = baseLifecycle,
  status: { status: string } | null = { status: 'draft' }
) {
  let created: unknown = null;
  let updated: unknown = null;
  let applied: unknown = null;
  let deleted: unknown = null;

  const store: TournamentLifecycleStore = {
    findWithLifecycle(id) {
      return Promise.resolve(lifecycle?.id === id ? lifecycle : null);
    },
    findStatus(id) {
      return Promise.resolve(id === 'tournament-1' ? status : null);
    },
    create(command) {
      created = command;
      return Promise.resolve(baseRow);
    },
    update(command) {
      updated = command;
      return Promise.resolve({ ...baseRow, ...command });
    },
    applyStatus(input) {
      applied = input;
      return Promise.resolve({ ...baseRow, status: input.status });
    },
    delete(command) {
      deleted = command;
      return Promise.resolve(baseRow);
    },
  };

  return {
    store,
    get created() {
      return created;
    },
    get updated() {
      return updated;
    },
    get applied() {
      return applied;
    },
    get deleted() {
      return deleted;
    },
  };
}

describe('tournament lifecycle use cases', () => {
  it('createTournament delegates store.create', async () => {
    const fixture = fakeStore();

    await createTournament({ name: 'Spring Open' }, fixture.store);

    expect(fixture.created).toEqual({ name: 'Spring Open' });
  });

  it('updateTournament throws NotFoundError when tournament is missing', async () => {
    const fixture = fakeStore(baseLifecycle, null);

    await expect(
      updateTournament({ id: 'tournament-1', name: 'Renamed' }, fixture.store)
    ).rejects.toThrow(NotFoundError);

    expect(fixture.updated).toBeNull();
  });

  it('updateTournament allows renaming completed tournaments', async () => {
    const fixture = fakeStore(
      { ...baseLifecycle, status: 'completed' },
      { status: 'completed' }
    );

    await updateTournament(
      { id: 'tournament-1', name: 'Renamed' },
      fixture.store
    );

    expect(fixture.updated).toMatchObject({ name: 'Renamed' });
  });

  it('setTournamentStatus rejects skipping from draft to completed', async () => {
    const fixture = fakeStore();

    await expect(
      setTournamentStatus(
        {
          id: 'tournament-1',
          status: 'completed',
          adminId: 'admin-1',
        },
        fixture.store
      )
    ).rejects.toThrow(BadRequestError);

    expect(fixture.applied).toBeNull();
  });

  it('setTournamentStatus rejects completion when lifecycle is not ready', async () => {
    const fixture = fakeStore({
      ...baseLifecycle,
      status: 'active',
      lifecycle: { canComplete: false },
    });

    await expect(
      setTournamentStatus(
        {
          id: 'tournament-1',
          status: 'completed',
          adminId: 'admin-1',
        },
        fixture.store
      )
    ).rejects.toThrow(
      'Tournament cannot be completed until every group has winner results'
    );

    expect(fixture.applied).toBeNull();
  });

  it('setTournamentStatus allows forced transitions for non-completed tournaments', async () => {
    const fixture = fakeStore({
      ...baseLifecycle,
      status: 'active',
      lifecycle: { canComplete: false },
    });

    await setTournamentStatus(
      {
        id: 'tournament-1',
        status: 'draft',
        adminId: 'admin-1',
        force: true,
      },
      fixture.store
    );

    expect(fixture.applied).toMatchObject({
      status: 'draft',
      fromStatus: 'active',
      force: true,
    });
  });

  it('setTournamentStatus allows forced changes from completed tournaments', async () => {
    const fixture = fakeStore({
      ...baseLifecycle,
      status: 'completed',
      lifecycle: { canComplete: true },
    });

    await setTournamentStatus(
      {
        id: 'tournament-1',
        status: 'active',
        adminId: 'admin-1',
        force: true,
      },
      fixture.store
    );

    expect(fixture.applied).toMatchObject({
      status: 'active',
      fromStatus: 'completed',
    });
  });

  it('deleteTournament allows completed tournaments', async () => {
    const fixture = fakeStore(baseLifecycle, { status: 'completed' });

    await deleteTournament(
      { id: 'tournament-1', adminId: 'admin-1' },
      fixture.store
    );

    expect(fixture.deleted).not.toBeNull();
  });

  it('deleteTournament rejects active tournaments', async () => {
    const fixture = fakeStore(baseLifecycle, { status: 'active' });

    await expect(
      deleteTournament(
        { id: 'tournament-1', adminId: 'admin-1' },
        fixture.store
      )
    ).rejects.toThrow(PolicyViolationError);

    expect(fixture.deleted).toBeNull();
  });
});
