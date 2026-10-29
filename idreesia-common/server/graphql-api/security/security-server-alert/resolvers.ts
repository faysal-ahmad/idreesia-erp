import { SecurityServerAlerts } from 'meteor/idreesia-common/server/collections/security';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';
import {
  createMissingSecurityServerAlertThumbnails,
  getSecurityServerAlertLastSyncedAt,
  setSecurityServerAlertReview,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

import {
  getSecurityServerAlertGroups,
  getSecurityServerAlerts,
} from './queries';

const REVIEW_VALUES = ['CORRECT', 'FALSE_POSITIVE'];

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityServerAlertType: {
    imageUrl: async alert => getFileUrl(alert.imageKey),
    thumbnailUrl: async alert =>
      alert.thumbnailKey ? getFileUrl(alert.thumbnailKey) : null,
  },
  SecurityServerAlertGroupType: {
    latestImageUrl: async group => getFileUrl(group.latestImageKey),
    latestThumbnailUrl: async group =>
      group.latestThumbnailKey ? getFileUrl(group.latestThumbnailKey) : null,
  },
  Query: {
    pagedSecurityServerAlerts: async (obj, { filter }) =>
      getSecurityServerAlerts(filter ?? {}),

    pagedSecurityServerAlertGroups: async (obj, { filter }) =>
      getSecurityServerAlertGroups(filter ?? {}),

    securityServerAlertById: async (obj, { _id }) =>
      SecurityServerAlerts.findOneAsync(_id),

    securityServerAlertSyncStatus: async () => ({
      lastSyncedAt: await getSecurityServerAlertLastSyncedAt(),
    }),
  },
  Mutation: {
    setSecurityServerAlertReview: async (obj, { _id, review }, { user }) => {
      if (review != null && !REVIEW_VALUES.includes(review)) {
        throw new Error(`Invalid review '${review}'.`);
      }
      await setSecurityServerAlertReview(user, _id, review ?? null);
      return SecurityServerAlerts.findOneAsync(_id);
    },

    createMissingSecurityServerAlertThumbnails: async () =>
      createMissingSecurityServerAlertThumbnails(),
  },
};

export default resolvers;
