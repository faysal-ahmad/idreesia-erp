import {
  addSecurityServerProfileImage,
  removeSecurityServerProfileImage,
  resolveSecurityServerProfileDefaultImageId,
  updateSecurityServerProfile,
  type ProfileValues,
  type SyncUser,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';
import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';
import { getSecurityServerProfiles } from 'meteor/idreesia-common/server/graphql-api/security/security-server-profile/queries';
import type { SecurityServerProfileDocument } from 'meteor/idreesia-common/server/collections/security/security-server-profiles';

import type { CommitteeFeatureHandler } from './types';

// The feature works on the profiles kept in the ERP (changes reach the
// security server through the usual sync), so there is nothing to set up
// outside the ERP when it is turned on or off.
export const monitoringProfilesHandler: CommitteeFeatureHandler = {
  enable: () => Promise.resolve(),
  disable: () => Promise.resolve(),
};

/**
 * A profile as the Workspaces feature shows it: no audit fields, and photos
 * as URLs with the default photo first.
 */
const toWorkspaceProfile = async (profile: SecurityServerProfileDocument) => {
  const images = profile.images ?? [];
  const defaultImageId = resolveSecurityServerProfileDefaultImageId({
    defaultImageId: profile.defaultImageId,
    images,
  });
  const ordered = [
    ...images.filter(image => image._id === defaultImageId),
    ...images.filter(image => image._id !== defaultImageId),
  ];

  const [photos, alertsCount] = await Promise.all([
    Promise.all(
      ordered.map(async image => ({
        _id: image._id,
        imageUrl: await getFileUrl(image.imageKey),
        thumbnailUrl: image.thumbnailKey
          ? await getFileUrl(image.thumbnailKey)
          : null,
      }))
    ),
    SecurityServerAlerts.find({
      profileId: { $eq: profile._id },
    }).countAsync(),
  ]);

  return {
    _id: profile._id,
    name: profile.name,
    isTest: !!profile.isTest,
    photos,
    alertsCount,
  };
};

export interface WorkspaceMonitoringProfilesFilter {
  // Part of the profile name, case-insensitive.
  name?: string | null;
  // Test profiles; included unless false.
  includeTest?: boolean | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The security server's (not deleted) profiles, by name, for committees with
 * the Monitoring Profiles feature. Test profiles are included unless
 * `includeTest` is false.
 */
export const getWorkspaceMonitoringProfiles = async ({
  name,
  includeTest,
  pageIndex,
  pageSize,
}: WorkspaceMonitoringProfilesFilter) => {
  const { data, totalResults } = (await getSecurityServerProfiles({
    name,
    includeTest: includeTest === false ? 'false' : 'true',
    pageIndex,
    pageSize,
  })) as unknown as {
    data: SecurityServerProfileDocument[];
    totalResults: number;
  };

  const rows = await Promise.all(data.map(toWorkspaceProfile));

  return { data: rows, totalResults };
};

/** One profile that isn't deleted, or null. */
export const getWorkspaceMonitoringProfileById = async (
  profileId: string
) => {
  const profile = await SecurityServerProfiles.findOneAsync({
    _id: profileId,
    deletedAt: { $exists: false },
  });
  return profile ? toWorkspaceProfile(profile) : null;
};

/** Renames the profile and/or sets its test flag; returns it as updated. */
export const updateWorkspaceMonitoringProfile = async (
  user: SyncUser,
  profileId: string,
  values: ProfileValues
) => {
  const name = values.name.trim();
  if (!name) throw new Error('Please enter a name.');
  await updateSecurityServerProfile(user, profileId, { ...values, name });
  return getWorkspaceMonitoringProfileById(profileId);
};

// The camera sends a canvas data URL and the gallery picker may too; accept
// either, with or without the prefix.
const stripDataUrlPrefix = (imageData: string) =>
  imageData.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

/**
 * Adds a photo (base64, optionally as a data: URL) to the profile; returns
 * it as updated. Rejected with a user-facing reason unless the photo has
 * exactly one face the security server can use.
 */
export const addWorkspaceMonitoringProfilePhoto = async (
  user: SyncUser,
  profileId: string,
  imageData: string
) => {
  await addSecurityServerProfileImage(user, profileId, {
    mimeType: 'image/jpeg',
    data: Buffer.from(stripDataUrlPrefix(imageData), 'base64'),
  });
  return getWorkspaceMonitoringProfileById(profileId);
};

/** Removes one of the profile's photos; returns the profile as updated. */
export const removeWorkspaceMonitoringProfilePhoto = async (
  user: SyncUser,
  profileId: string,
  photoId: string
) => {
  await removeSecurityServerProfileImage(user, profileId, photoId);
  return getWorkspaceMonitoringProfileById(profileId);
};
