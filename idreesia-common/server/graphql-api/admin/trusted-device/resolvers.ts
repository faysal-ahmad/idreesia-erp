import { DataSource } from 'meteor/idreesia-common/constants';
import {
  enrollTrustedDevice,
  removeTrustedDevice,
  revokeUserTrustedDevices,
} from 'meteor/idreesia-common/server/business-logic/admin';
import {
  TrustedDevices,
  type TrustedDeviceDocument,
} from 'meteor/idreesia-common/server/collections/admin';

interface ResolverContext {
  user?: { _id: string };
}

function requireUser(user: ResolverContext['user']) {
  if (!user) {
    throw new Error('User is required.');
  }
  return user;
}

// A device that is neither revoked nor expired.
const findActiveDevices = (userId: string) =>
  TrustedDevices.find(
    { userId, revokedAt: null, expiresAt: { $gt: new Date() } },
    { sort: { createdAt: -1 } }
  ).fetchAsync();

const toIso = (date?: Date | null) => (date ? date.toISOString() : null);

export default {
  TrustedDeviceType: {
    createdAt: (device: TrustedDeviceDocument) => toIso(device.createdAt),
    lastUsedAt: (device: TrustedDeviceDocument) => toIso(device.lastUsedAt),
    expiresAt: (device: TrustedDeviceDocument) => toIso(device.expiresAt),
  },

  Query: {
    myTrustedDevices: async (
      _obj: unknown,
      _args: unknown,
      { user }: ResolverContext
    ) => findActiveDevices(requireUser(user)._id),

    userTrustedDevices: async (
      _obj: unknown,
      { userId }: { userId: string }
    ) => findActiveDevices(userId),
  },

  Mutation: {
    enrollTrustedDevice: async (
      _obj: unknown,
      params: {
        pin: string;
        name?: string | null;
        code?: string | null;
        replaceDeviceId?: string | null;
      },
      { user }: ResolverContext
    ) => enrollTrustedDevice(params, requireUser(user), DataSource.ADMIN),

    removeTrustedDevice: async (
      _obj: unknown,
      { deviceId }: { deviceId: string },
      { user }: ResolverContext
    ) => {
      await removeTrustedDevice({ deviceId }, requireUser(user), DataSource.ADMIN);
      return true;
    },

    revokeUserTrustedDevices: async (
      _obj: unknown,
      { userId }: { userId: string },
      { user }: ResolverContext
    ) =>
      revokeUserTrustedDevices({ userId }, requireUser(user), DataSource.ADMIN),
  },
};
