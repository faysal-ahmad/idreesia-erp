import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import {
  addSecurityServerProfileImage,
  createMissingSecurityServerProfileThumbnails,
  createSecurityServerProfile,
  deleteSecurityServerProfile,
  removeSecurityServerProfileImage,
  resolveSecurityServerProfileDefaultImageId,
  setSecurityServerProfileDefaultImage,
  updateSecurityServerProfile,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';

import { getSecurityServerProfiles } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// The camera capture sends a canvas data URL and the file picker a FileReader
// one; tolerate either, with or without the prefix.
const stripDataUrlPrefix = (imageData: string) =>
  imageData.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

const resolvers: ResolverMap = {
  SecurityServerProfileImageType: {
    imageUrl: async image => getFileUrl(image.imageKey),
    thumbnailUrl: async image =>
      image.thumbnailKey ? getFileUrl(image.thumbnailKey) : null,
  },
  SecurityServerProfileType: {
    defaultImageId: async profile =>
      resolveSecurityServerProfileDefaultImageId(profile),
    alertsCount: async profile =>
      SecurityServerAlerts.find({
        profileId: { $eq: profile._id },
      }).countAsync(),
  },
  Query: {
    pagedSecurityServerProfiles: async (obj, { filter }) =>
      getSecurityServerProfiles(filter ?? {}),

    securityServerProfileById: async (obj, { _id }) =>
      SecurityServerProfiles.findOneAsync(_id),
  },
  Mutation: {
    createSecurityServerProfile: async (obj, { name, isTest }, { user }) => {
      const profileId = await createSecurityServerProfile(user, {
        name,
        isTest,
      });
      return SecurityServerProfiles.findOneAsync(profileId);
    },

    updateSecurityServerProfile: async (
      obj,
      { _id, name, isTest },
      { user }
    ) => {
      await updateSecurityServerProfile(user, _id, { name, isTest });
      return SecurityServerProfiles.findOneAsync(_id);
    },

    deleteSecurityServerProfile: async (obj, { _id }, { user }) => {
      await deleteSecurityServerProfile(user, _id);
      return 1;
    },

    addSecurityServerProfileImage: async (
      obj,
      { profileId, imageData },
      { user }
    ) => {
      await addSecurityServerProfileImage(user, profileId, {
        mimeType: 'image/jpeg',
        data: Buffer.from(stripDataUrlPrefix(imageData), 'base64'),
      });
      return SecurityServerProfiles.findOneAsync(profileId);
    },

    removeSecurityServerProfileImage: async (
      obj,
      { profileId, imageId },
      { user }
    ) => {
      await removeSecurityServerProfileImage(user, profileId, imageId);
      return SecurityServerProfiles.findOneAsync(profileId);
    },

    setSecurityServerProfileDefaultImage: async (
      obj,
      { profileId, imageId },
      { user }
    ) => {
      await setSecurityServerProfileDefaultImage(user, profileId, imageId);
      return SecurityServerProfiles.findOneAsync(profileId);
    },

    createMissingSecurityServerProfileThumbnails: async () =>
      createMissingSecurityServerProfileThumbnails(),
  },
};

export default resolvers;
