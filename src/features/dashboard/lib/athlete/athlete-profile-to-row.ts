import type { AthleteProfileListItem } from '@/contracts/athlete-profiles/dto';

/** One editable row in the athlete drawer form. */
export type AthleteRow = {
  id: string;
  athleteCode: string;
  name: string;
  gender: 'M' | 'F';
  beltLevel: number;
  weight: number;
  affiliation: string;
  image: string;
};

export function athleteProfileToRow(
  profile: AthleteProfileListItem
): AthleteRow {
  return {
    id: profile.id,
    athleteCode: profile.athleteCode ?? '',
    name: profile.name,
    gender: profile.gender === 'F' ? 'F' : 'M',
    beltLevel: profile.beltLevel,
    weight: profile.weight,
    affiliation: profile.affiliation,
    image: profile.image ?? '',
  };
}
