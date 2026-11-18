import { GraphQLError } from 'graphql';

import { Committees } from 'meteor/idreesia-common/server/collections/admin';

import { assertLocationExists } from '../org-locations';

/**
 * Moves a committee to another location. Only the location changes; members,
 * features and everything else stay as they are.
 */
export async function moveCommittee(
  committeeId: string,
  locationId: string,
  userId: string
) {
  const committee = await Committees.findOneAsync(committeeId);
  if (!committee) {
    throw new GraphQLError('Committee not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  if (committee.locationId === locationId) {
    throw new GraphQLError('The committee is already in this location.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  await assertLocationExists(locationId);

  await Committees.updateAsync(committeeId, {
    $set: { locationId, updatedAt: new Date(), updatedBy: userId },
  });
  return Committees.findOneAsync(committeeId);
}
