import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Teams } from 'meteor/idreesia-common/server/collections/hr';

import { DAYS_OF_WEEK, isDayOfWeek } from '../hr-common/duty-planning-dates';
import {
  ensureDutyDayAttendancesForTeam,
  ensureDutyPlanIndexes,
} from './duty-planning';
import { ensureKarkuns } from './ensure-karkuns';

/*
 * Team membership changes. Each locks the team's past and current duty days
 * first, so the change only affects days still being planned; the locking
 * and the change are one transaction.
 */

const normalizeDaysOfWeek = (
  daysOfWeek: Array<string | null> | null | undefined
) => {
  const selected = new Set<string>();
  for (const day of daysOfWeek ?? []) {
    if (!day || !isDayOfWeek(day)) {
      throw new Error('Please select valid days.');
    }
    selected.add(day);
  }
  if (selected.size === 0) {
    throw new Error('Please select at least one day.');
  }
  return DAYS_OF_WEEK.filter(day => selected.has(day));
};

/** Updates one member of a team, failing if the karkun is not a member. */
export async function updateTeamMember(
  teamId: string,
  karkunId: string,
  modifier: Record<string, unknown>
) {
  const updated = await Teams.updateAsync(
    { _id: teamId, 'members.karkunId': karkunId },
    modifier
  );
  if (updated === 0) {
    throw new Error('This person is not a member of the team.');
  }
}

export async function addTeamMember(
  teamId: string,
  karkunId: string,
  daysOfWeek: Array<string | null> | null | undefined
) {
  const days = normalizeDaysOfWeek(daysOfWeek);
  await ensureDutyPlanIndexes();
  return runInTransaction(async () => {
    const team = await Teams.findOneAsync(teamId);
    if (!team) throw new Error('Team not found.');
    await ensureKarkuns([karkunId]);

    await ensureDutyDayAttendancesForTeam(teamId);
    const added = await Teams.updateAsync(
      { _id: teamId, 'members.karkunId': { $ne: karkunId } },
      { $push: { members: { karkunId, daysOfWeek: days } } }
    );
    if (added === 0) {
      throw new Error('This person is already a member of the team.');
    }
  });
}

export async function updateTeamMemberDays(
  teamId: string,
  karkunId: string,
  daysOfWeek: Array<string | null> | null | undefined
) {
  const days = normalizeDaysOfWeek(daysOfWeek);
  await ensureDutyPlanIndexes();
  return runInTransaction(async () => {
    await ensureDutyDayAttendancesForTeam(teamId);
    await updateTeamMember(teamId, karkunId, {
      $set: { 'members.$.daysOfWeek': days },
    });
  });
}

export async function removeTeamMember(teamId: string, karkunId: string) {
  await ensureDutyPlanIndexes();
  return runInTransaction(async () => {
    const team = await Teams.findOneAsync(teamId);
    if (!team) throw new Error('Team not found.');
    await ensureDutyDayAttendancesForTeam(teamId);
    await Teams.updateAsync(teamId, {
      $pull: { members: { karkunId } },
    });
  });
}
