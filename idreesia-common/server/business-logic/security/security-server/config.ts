import { createHash } from 'crypto';

import {
  SecurityServerChannels,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';

const ACTIVE = { deletedAt: { $exists: false } };

/**
 * A version tag for the configuration. Every edit - including adding or
 * removing an image and deleting a record - bumps a record's updatedAt, so
 * the newest updatedAt across both collections (deleted records included)
 * plus the active counts changes whenever the snapshot would.
 */
export async function getSecurityServerConfigVersion(): Promise<string> {
  const newest = { sort: { updatedAt: -1 as const }, fields: { updatedAt: 1 } };
  const [channel, profile, channelCount, profileCount] = await Promise.all([
    SecurityServerChannels.findOneAsync({}, newest),
    SecurityServerProfiles.findOneAsync({}, newest),
    SecurityServerChannels.find(ACTIVE).countAsync(),
    SecurityServerProfiles.find(ACTIVE).countAsync(),
  ]);

  const parts = [
    channel?.updatedAt?.getTime() ?? 0,
    profile?.updatedAt?.getTime() ?? 0,
    channelCount,
    profileCount,
  ];
  return createHash('sha1').update(parts.join(':')).digest('hex');
}

/**
 * Everything the security server needs to run, as a full snapshot of active
 * records. Anything missing from it has been deleted in the ERP. Includes the
 * channels' RTSP passwords, so it must only ever be served to the security
 * server's service account.
 */
export async function getSecurityServerConfig() {
  const [channels, profiles] = await Promise.all([
    SecurityServerChannels.find(ACTIVE, { sort: { name: 1 } }).fetchAsync(),
    SecurityServerProfiles.find(ACTIVE, { sort: { name: 1 } }).fetchAsync(),
  ]);

  return {
    generatedAt: new Date(),
    channels: channels.map(channel => ({
      id: channel._id,
      name: channel.name,
      enabled: channel.enabled,
      similarityThreshold: channel.similarityThreshold ?? null,
      recognitionFps: channel.recognitionFps,
      connection: {
        host: channel.connection.host,
        port: channel.connection.port ?? null,
        path: channel.connection.path ?? null,
        username: channel.connection.username ?? null,
        password: channel.connection.password ?? null,
      },
      updatedAt: channel.updatedAt,
    })),
    profiles: await Promise.all(
      profiles.map(async profile => ({
        id: profile._id,
        name: profile.name,
        isTest: profile.isTest,
        updatedAt: profile.updatedAt,
        images: await Promise.all(
          profile.images.map(async image => ({
            id: image._id,
            url: await getFileUrl(image.imageKey),
            uploadedAt: image.uploadedAt,
          }))
        ),
      }))
    ),
  };
}
