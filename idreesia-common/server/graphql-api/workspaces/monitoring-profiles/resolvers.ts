import {
  addWorkspaceMonitoringProfilePhoto,
  getWorkspaceMonitoringProfileById,
  getWorkspaceMonitoringProfiles,
  removeWorkspaceMonitoringProfilePhoto,
  updateWorkspaceMonitoringProfile,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import { assertMonitoringProfilesEnabled } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    workspaceMonitoringProfiles: async (
      obj,
      { committeeId, ...filter },
      context
    ) => {
      assertMonitoringProfilesEnabled(context, committeeId);
      return getWorkspaceMonitoringProfiles(filter);
    },

    workspaceMonitoringProfileById: async (
      obj,
      { committeeId, profileId },
      context
    ) => {
      assertMonitoringProfilesEnabled(context, committeeId);
      return getWorkspaceMonitoringProfileById(profileId);
    },
  },

  Mutation: {
    updateWorkspaceMonitoringProfile: async (
      obj,
      { committeeId, profileId, name, isTest },
      context
    ) => {
      assertMonitoringProfilesEnabled(context, committeeId);
      return updateWorkspaceMonitoringProfile(context.user, profileId, {
        name,
        isTest,
      });
    },

    addWorkspaceMonitoringProfilePhoto: async (
      obj,
      { committeeId, profileId, imageData },
      context
    ) => {
      assertMonitoringProfilesEnabled(context, committeeId);
      return addWorkspaceMonitoringProfilePhoto(context.user, profileId, imageData);
    },

    removeWorkspaceMonitoringProfilePhoto: async (
      obj,
      { committeeId, profileId, photoId },
      context
    ) => {
      assertMonitoringProfilesEnabled(context, committeeId);
      return removeWorkspaceMonitoringProfilePhoto(context.user, profileId, photoId);
    },
  },
};

export default resolvers;
