import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { DISCUSSIONS_MODULE } from 'meteor/idreesia-common/server/business-logic/discussions';
import { DMS_MODULE } from 'meteor/idreesia-common/server/business-logic/dms';
import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import type { NotificationScope } from 'meteor/idreesia-common/server/headless';

import { MEMBERS_MODULE } from './members-notifications';
import type { CommitteeDoc } from './types';

/**
 * The modules enabled on every committee the person belongs to: the headless
 * modules that have a workspace for it, and Members. Notifications belong to
 * a committee and module, so this is what decides which ones a user can see.
 */
export const getPersonNotificationScope = async (
  personId: string
): Promise<NotificationScope> => {
  const committees = (await Committees.find({
    'members.karkunId': personId,
  }).fetchAsync()) as unknown as CommitteeDoc[];

  const scope: NotificationScope = [];
  committees.forEach(committee => {
    const features = committee.features ?? [];
    const committeeId = committee._id;
    if (
      committee.discussionsWorkspaceId &&
      features.includes(CommitteeFeatureKeys.DISCUSSIONS)
    ) {
      scope.push({ committeeId, module: DISCUSSIONS_MODULE });
    }
    if (
      committee.dmsWorkspaceId &&
      features.includes(CommitteeFeatureKeys.DOCUMENTS)
    ) {
      scope.push({ committeeId, module: DMS_MODULE });
    }
    if (features.includes(CommitteeFeatureKeys.MEMBERS)) {
      scope.push({ committeeId, module: MEMBERS_MODULE });
    }
  });
  return scope;
};
