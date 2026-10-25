import {
  SecurityServerAlerts,
  SecurityServerChannels,
} from 'meteor/idreesia-common/server/collections/security';

import type { ChannelPayload, SyncUser } from './types';

export async function upsertSecurityServerChannel(
  user: SyncUser,
  externalId: string,
  { name, enabled, similarityThreshold, recognitionFps }: ChannelPayload
): Promise<string> {
  const date = new Date();
  const existing = await SecurityServerChannels.findOneAsync({ externalId });

  if (!existing) {
    return SecurityServerChannels.insertAsync({
      externalId,
      name,
      enabled,
      ...(similarityThreshold != null ? { similarityThreshold } : {}),
      recognitionFps,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
  }

  const $unset: Record<string, ''> = { deletedAt: '', deletedBy: '' };
  if (similarityThreshold == null) $unset.similarityThreshold = '';

  await SecurityServerChannels.updateAsync(existing._id, {
    $set: {
      name,
      enabled,
      ...(similarityThreshold != null ? { similarityThreshold } : {}),
      recognitionFps,
      updatedAt: date,
      updatedBy: user._id,
    },
    $unset,
  });

  if (existing.name !== name) {
    await SecurityServerAlerts.updateAsync(
      { channelId: existing._id },
      { $set: { channelName: name } },
      { multi: true }
    );
  }

  return existing._id;
}

/** Soft-deletes the channel; its alerts are kept. */
export async function deleteSecurityServerChannel(
  user: SyncUser,
  externalId: string
): Promise<void> {
  const date = new Date();
  await SecurityServerChannels.updateAsync(
    { externalId, deletedAt: { $exists: false } },
    {
      $set: {
        deletedAt: date,
        deletedBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      },
    }
  );
}
