import {
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import type { SecurityServerChannelDocument } from 'meteor/idreesia-common/server/collections/security/security-server-channels';
import type { SecurityServerProfileDocument } from 'meteor/idreesia-common/server/collections/security/security-server-profiles';
import { getFile } from 'meteor/idreesia-common/server/file-storage';

import {
  createSecurityServerChannel,
  deleteSecurityServerChannel,
  updateSecurityServerChannel,
} from './channels';
import { SecurityServerSyncError } from './errors';
import {
  createSecurityServerProfile,
  deleteSecurityServerProfile,
  removeSecurityServerProfileImage,
  storeSecurityServerProfileImage,
  updateSecurityServerProfile,
} from './profiles';
import type { ChannelValues, ProfileValues, SyncUser } from './types';

/**
 * Two-way sync of channels and profiles with the security server, which
 * drives it: it pulls what changed here since its last sync, then pushes what
 * changed on its side. Each side keeps its own ids and stores the other side's
 * id as `externalId` - unset here until the security server has received the
 * record. See docs/security-server-sync-api.md.
 */

const blankToNull = (value?: string | null) => value?.trim() || null;

/**
 * Channels and profiles created, updated or deleted since `since` (inclusive),
 * or every active one when `since` is null. `serverTime` is the cursor for the
 * next call.
 */
export async function getSecurityServerChanges(since: Date | null) {
  // Taken before reading, so anything written meanwhile comes back next time
  // rather than being missed.
  const serverTime = new Date();
  const selector = since
    ? { updatedAt: { $gte: since } }
    : { deletedAt: { $exists: false } };
  const [channels, profiles] = await Promise.all([
    SecurityServerChannels.find(selector).fetchAsync(),
    SecurityServerProfiles.find(selector).fetchAsync(),
  ]);

  return {
    serverTime,
    channels: channels.map(channel =>
      channel.deletedAt
        ? {
            id: channel._id,
            externalId: channel.externalId ?? null,
            deleted: true,
          }
        : {
            id: channel._id,
            externalId: channel.externalId ?? null,
            deleted: false,
            name: channel.name,
            enabled: channel.enabled,
            similarityThreshold: channel.similarityThreshold ?? null,
            recognitionFps: channel.recognitionFps,
            minFaceSizePx: channel.minFaceSizePx ?? null,
            minFaceQuality: channel.minFaceQuality ?? null,
            connection: {
              host: channel.connection.host,
              port: channel.connection.port ?? null,
              path: channel.connection.path ?? null,
              username: channel.connection.username ?? null,
              password: channel.connection.password ?? null,
            },
          }
    ),
    profiles: profiles.map(profile =>
      profile.deletedAt
        ? {
            id: profile._id,
            externalId: profile.externalId ?? null,
            deleted: true,
          }
        : {
            id: profile._id,
            externalId: profile.externalId ?? null,
            deleted: false,
            name: profile.name,
            isTest: profile.isTest,
            images: profile.images.map(image => ({
              id: image._id,
              externalId: image.externalId ?? null,
            })),
            // As chosen (null = never chosen): both sides fall back to the
            // oldest photo the same way.
            defaultImageId: profile.defaultImageId ?? null,
          }
    ),
  };
}

/** One profile photo's JPEG, for the security server to download. */
export async function getSecurityServerProfileImage(
  profileId: string,
  imageId: string
): Promise<Buffer> {
  const profile = await SecurityServerProfiles.findOneAsync({
    _id: profileId,
    deletedAt: { $exists: false },
  });
  const image = profile?.images.find(({ _id }) => _id === imageId);
  if (!image) {
    throw new SecurityServerSyncError(404, 'Profile image not found.');
  }
  const { body } = await getFile(image.imageKey);
  return body;
}

// A pushed record is found by the security server's id when it's already
// linked, else by the ERP id the security server holds for it (a record that
// came from the ERP, being sent back for the first time).
const findForSync = async <T extends { _id: string }>(
  collection: {
    findOneAsync(selector: object | string): Promise<T | undefined>;
  },
  localId: string,
  erpId: string | null
): Promise<T | undefined> =>
  (await collection.findOneAsync({ externalId: localId })) ??
  (erpId ? await collection.findOneAsync(erpId) : undefined);

// Links the record to the security server's id and, when it was deleted here,
// restores it - the security server's edit wins over a delete in the ERP.
const linkAndRestore = async (
  collection: typeof SecurityServerChannels | typeof SecurityServerProfiles,
  record: { _id: string; externalId?: string; deletedAt?: Date },
  user: SyncUser,
  localId: string
) => {
  if (record.externalId !== localId) {
    await collection.updateAsync(record._id, {
      $set: { externalId: localId },
    });
  }
  if (record.deletedAt) {
    await collection.updateAsync(record._id, {
      $unset: { deletedAt: '', deletedBy: '' },
      $set: { updatedAt: new Date(), updatedBy: user._id },
    });
  }
};

const channelDiffers = (
  channel: SecurityServerChannelDocument,
  {
    name,
    enabled,
    similarityThreshold,
    recognitionFps,
    minFaceSizePx,
    minFaceQuality,
    connection,
  }: ChannelValues
) =>
  channel.name !== name.trim() ||
  channel.enabled !== enabled ||
  (channel.similarityThreshold ?? null) !== (similarityThreshold ?? null) ||
  channel.recognitionFps !== recognitionFps ||
  (channel.minFaceSizePx ?? null) !== (minFaceSizePx ?? null) ||
  (channel.minFaceQuality ?? null) !== (minFaceQuality ?? null) ||
  channel.connection.host !== connection.host.trim() ||
  (channel.connection.port ?? null) !== (connection.port || null) ||
  blankToNull(channel.connection.path) !== blankToNull(connection.path) ||
  blankToNull(channel.connection.username) !==
    blankToNull(connection.username) ||
  // An empty password means "keep the stored one".
  (!!connection.password &&
    channel.connection.password !== connection.password);

// The ERP id the security server holds for the record (its externalId), if
// any. A deleted record carries no values.
export type ChannelSyncPush =
  | { erpId: string | null; deleted: true }
  | ({ erpId: string | null; deleted: false } & ChannelValues);

/**
 * Applies a channel pushed by the security server. Idempotent: a repeated
 * push finds the same record by the security server's id. Returns the ERP id,
 * or null for a delete of a channel the ERP never had.
 */
export async function upsertSecurityServerChannelFromSync(
  user: SyncUser,
  localId: string,
  push: ChannelSyncPush
): Promise<string | null> {
  const existing = await findForSync<SecurityServerChannelDocument>(
    SecurityServerChannels,
    localId,
    push.erpId
  );

  if (push.deleted) {
    if (existing && !existing.deletedAt) {
      await deleteSecurityServerChannel(user, existing._id);
    }
    return existing?._id ?? null;
  }

  const values: ChannelValues = {
    name: push.name,
    enabled: push.enabled,
    similarityThreshold: push.similarityThreshold,
    recognitionFps: push.recognitionFps,
    minFaceSizePx: push.minFaceSizePx ?? null,
    minFaceQuality: push.minFaceQuality ?? null,
    connection: push.connection,
  };
  if (!existing) {
    const channelId = await createSecurityServerChannel(user, values);
    await SecurityServerChannels.updateAsync(channelId, {
      $set: { externalId: localId },
    });
    return channelId;
  }

  await linkAndRestore(SecurityServerChannels, existing, user, localId);
  if (channelDiffers(existing, values)) {
    await updateSecurityServerChannel(user, existing._id, values);
  }
  return existing._id;
}

export interface ProfileSyncImage {
  localId: string;
  // The ERP id the security server holds for this photo, if any.
  erpId: string | null;
  // The JPEG, sent for photos the ERP doesn't have yet.
  data: Buffer | null;
}

export type ProfileSyncPush =
  | { erpId: string | null; deleted: true }
  | ({
      erpId: string | null;
      deleted: false;
      // The profile's full photo set on the security server.
      images: ProfileSyncImage[];
      // The security server's id for its default photo (one of `images`);
      // null = none chosen. Undefined from a server that predates it: the
      // ERP's own choice is kept.
      defaultImageId?: string | null;
    } & ProfileValues);

export interface ProfileSyncResult {
  _id: string | null;
  images: { localId: string; _id: string }[];
  // Photos sent without their JPEG that the ERP no longer has; the security
  // server sends them again with it.
  missingImages: string[];
}

/**
 * Points the profile's default photo at the one the security server chose.
 * A photo the ERP doesn't have yet (in `missingImages`) leaves it unchanged
 * until it arrives on a later sync. Not a change to send back, so updatedAt
 * is kept.
 */
async function applyPushedDefaultImage(
  profileId: string,
  pushedDefaultImageId: string | null | undefined,
  { images }: ProfileSyncResult
): Promise<void> {
  if (pushedDefaultImageId === undefined) return;
  const defaultImageId =
    pushedDefaultImageId === null
      ? null
      : images.find(({ localId }) => localId === pushedDefaultImageId)?._id;
  if (defaultImageId === undefined) return;

  const profile = (await SecurityServerProfiles.findOneAsync(profileId))!;
  if ((profile.defaultImageId ?? null) === defaultImageId) return;
  await SecurityServerProfiles.updateAsync(
    profileId,
    defaultImageId === null
      ? { $unset: { defaultImageId: '' } }
      : { $set: { defaultImageId } }
  );
}

/**
 * Applies a profile pushed by the security server, making its photos match
 * the pushed set. Photos are stored without a quality check: the security
 * server checked them when they were uploaded there.
 */
export async function upsertSecurityServerProfileFromSync(
  user: SyncUser,
  localId: string,
  push: ProfileSyncPush
): Promise<ProfileSyncResult> {
  const existing = await findForSync<SecurityServerProfileDocument>(
    SecurityServerProfiles,
    localId,
    push.erpId
  );

  if (push.deleted) {
    if (existing && !existing.deletedAt) {
      await deleteSecurityServerProfile(user, existing._id);
    }
    return { _id: existing?._id ?? null, images: [], missingImages: [] };
  }

  const { name, isTest, images } = push;
  let profileId: string;
  if (!existing) {
    profileId = await createSecurityServerProfile(user, { name, isTest });
    await SecurityServerProfiles.updateAsync(profileId, {
      $set: { externalId: localId },
    });
  } else {
    profileId = existing._id;
    await linkAndRestore(SecurityServerProfiles, existing, user, localId);
    if (existing.name !== name.trim() || existing.isTest !== isTest) {
      await updateSecurityServerProfile(user, profileId, { name, isTest });
    }
  }

  const profile = (await SecurityServerProfiles.findOneAsync(profileId))!;
  const result: ProfileSyncResult = {
    _id: profileId,
    images: [],
    missingImages: [],
  };
  const kept = new Set<string>();

  for (const image of images) {
    const match =
      profile.images.find(({ externalId }) => externalId === image.localId) ??
      (image.erpId
        ? profile.images.find(({ _id }) => _id === image.erpId)
        : undefined);

    if (match) {
      kept.add(match._id);
      if (match.externalId !== image.localId) {
        await SecurityServerProfiles.updateAsync(
          { _id: profileId, 'images._id': match._id },
          { $set: { 'images.$.externalId': image.localId } }
        );
      }
      result.images.push({ localId: image.localId, _id: match._id });
    } else if (image.data) {
      const imageId = await storeSecurityServerProfileImage(
        user,
        profileId,
        image.data,
        image.localId
      );
      kept.add(imageId);
      result.images.push({ localId: image.localId, _id: imageId });
    } else {
      result.missingImages.push(image.localId);
    }
  }

  for (const image of profile.images.filter(({ _id }) => !kept.has(_id))) {
    await removeSecurityServerProfileImage(user, profileId, image._id);
  }

  await applyPushedDefaultImage(profileId, push.defaultImageId, result);

  return result;
}
