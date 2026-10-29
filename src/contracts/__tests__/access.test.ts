import { describe, expect, it } from 'vitest';
import { getAccess } from '@/contracts/base';
import { contract } from '@/contracts/router';

type Node = { '~orpc'?: { meta: Record<string, unknown> } } & Record<
  string,
  unknown
>;

function accessByPath(
  node: Node,
  path: Array<string> = []
): Record<string, unknown> {
  if (node['~orpc']) {
    return { [path.join('.')]: getAccess(node as never) };
  }
  return Object.fromEntries(
    Object.entries(node).flatMap(([key, child]) =>
      Object.entries(accessByPath(child as Node, [...path, key]))
    )
  );
}

const MEMBER = [
  'activity.listForTournament',
  'advanceSettings.selectionCatalog',
  'advanceSettings.selectionMatches',
  'athleteProfile.checkDuplicate',
  'athleteProfile.list',
  'device.lastSelection.get',
  'division.get',
  'division.list',
  'match.get',
  'match.list',
  'tournament.get',
  'tournament.list',
  'tournamentAthlete.list',
];

describe('contract access', () => {
  it('opens only the read procedures to members; everything else is admin', () => {
    const access = accessByPath(contract as unknown as Node);
    const members = Object.keys(access)
      .filter((path) => access[path] === 'member')
      .sort();

    expect(members).toEqual(MEMBER);
    expect(
      Object.values(access).every((a) => a === 'admin' || a === 'member')
    ).toBe(true);
  });
});
