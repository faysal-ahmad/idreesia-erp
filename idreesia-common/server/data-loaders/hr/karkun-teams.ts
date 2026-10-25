import DataLoader from 'dataloader';
import { Teams } from 'meteor/idreesia-common/server/collections/hr';

interface TeamRecord extends Record<string, unknown> {
  name?: string;
  members?: Array<{ karkunId: string }> | null;
}

// Teams each karkun is a member of, sorted by team name.
export async function getKarkunTeams(karkunIds: readonly string[]) {
  const teams = (await Teams.find(
    { 'members.karkunId': { $in: [...karkunIds] } },
    { sort: { name: 1 } }
  ).fetchAsync()) as TeamRecord[];

  return karkunIds.map(karkunId =>
    teams.filter(team =>
      (team.members ?? []).some(member => member.karkunId === karkunId)
    )
  );
}

export const karkunTeamsDataLoader = () =>
  new DataLoader<string, TeamRecord[]>(getKarkunTeams);
