import {
  addWorkspaceMonitoringProfilePhoto,
  getWorkspaceMonitoringProfileById,
  getWorkspaceMonitoringProfiles,
  removeWorkspaceMonitoringProfilePhoto,
  updateWorkspaceMonitoringProfile,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { assertCanUseMonitoringProfiles } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    workspaceMonitoringProfiles: async (
      obj,
      { committeeId, ...filter },
      { user }
    ) => {
      await assertCanUseMonitoringProfiles(user, committeeId);
      return getWorkspaceMonitoringProfiles(filter);
    },

    workspaceMonitoringProfileById: async (
      obj,
      { committeeId, profileId },
      { user }
    ) => {
      await assertCanUseMonitoringProfiles(user, committeeId);
      return getWorkspaceMonitoringProfileById(profileId);
    },
  },

  Mutation: {
    updateWorkspaceMonitoringProfile: async (
      obj,
      { committeeId, profileId, name, isTest },
      { user }
    ) => {
      await assertCanUseMonitoringProfiles(user, committeeId);
      return updateWorkspaceMonitoringProfile(user, profileId, {
        name,
        isTest,
      });
    },

    addWorkspaceMonitoringProfilePhoto: async (
      obj,
      { committeeId, profileId, imageData },
      { user }
    ) => {
      await assertCanUseMonitoringProfiles(user, committeeId);
      return addWorkspaceMonitoringProfilePhoto(user, profileId, imageData);
    },

    removeWorkspaceMonitoringProfilePhoto: async (
      obj,
      { committeeId, profileId, photoId },
      { user }
    ) => {
      await assertCanUseMonitoringProfiles(user, committeeId);
      return removeWorkspaceMonitoringProfilePhoto(user, profileId, photoId);
    },
  },
};

export default resolvers;
