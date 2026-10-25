import {
  SecurityServerAlerts,
  SecurityServerChannels,
} from 'meteor/idreesia-common/server/collections/security';

import type { ChannelConnectionValues, ChannelValues, SyncUser } from './types';

const getActiveChannel = async (channelId: string) => {
  const channel = await SecurityServerChannels.findOneAsync({
    _id: channelId,
    deletedAt: { $exists: false },
  });
  if (!channel) throw new Error('Channel not found.');
  return channel;
};

// Blank optional values are dropped rather than stored as empty strings.
const toConnection = (
  { host, port, path, username }: ChannelConnectionValues,
  password: string | undefined
) => ({
  host: host.trim(),
  ...(port ? { port } : {}),
  ...(path?.trim() ? { path: path.trim() } : {}),
  ...(username?.trim() ? { username: username.trim() } : {}),
  ...(password ? { password } : {}),
});

export async function createSecurityServerChannel(
  user: SyncUser,
  {
    name,
    enabled,
    similarityThreshold,
    recognitionFps,
    connection,
  }: ChannelValues
): Promise<string> {
  const date = new Date();
  return SecurityServerChannels.insertAsync({
    name: name.trim(),
    enabled,
    ...(similarityThreshold != null ? { similarityThreshold } : {}),
    recognitionFps,
    connection: toConnection(connection, connection.password || undefined),
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
}

export async function updateSecurityServerChannel(
  user: SyncUser,
  channelId: string,
  {
    name,
    enabled,
    similarityThreshold,
    recognitionFps,
    connection,
  }: ChannelValues
): Promise<void> {
  const existing = await getActiveChannel(channelId);
  // An empty password means "keep the one already stored".
  const password = connection.password || existing.connection.password;
  const trimmedName = name.trim();

  await SecurityServerChannels.updateAsync(channelId, {
    $set: {
      name: trimmedName,
      enabled,
      ...(similarityThreshold != null ? { similarityThreshold } : {}),
      recognitionFps,
      connection: toConnection(connection, password),
      updatedAt: new Date(),
      updatedBy: user._id,
    },
    ...(similarityThreshold == null
      ? { $unset: { similarityThreshold: '' as const } }
      : {}),
  });

  if (existing.name !== trimmedName) {
    await SecurityServerAlerts.updateAsync(
      { channelId },
      { $set: { channelName: trimmedName } },
      { multi: true }
    );
  }
}

/** Soft-deletes the channel; its alerts are kept. */
export async function deleteSecurityServerChannel(
  user: SyncUser,
  channelId: string
): Promise<void> {
  await getActiveChannel(channelId);
  const date = new Date();
  await SecurityServerChannels.updateAsync(channelId, {
    $set: {
      deletedAt: date,
      deletedBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    },
  });
}
