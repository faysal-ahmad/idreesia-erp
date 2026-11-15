import {
  Users,
  type AppUser,
} from 'meteor/idreesia-common/server/collections/admin';
import { get } from 'meteor/idreesia-common/utilities/lodash';

import { isTwoFactorEnabled } from './two-factor-status';

export interface MappedUser extends Record<string, any> {
  _id: string;
  permissions: string[];
  instances: string[];
  groups: string[];
}

/** The fields of an ERP user that the API exposes. */
export const mapUser = (user: AppUser): MappedUser => ({
  _id: user._id,
  username: user.username,
  email: get(user, 'emails.0.address', null),
  emailVerified: get(user, 'emails.0.verified', false),
  displayName: user.profile?.name,
  personId: user.personId,
  locked: user.locked,
  lastLoggedInAt: user.lastLoggedInAt,
  lastActiveAt: user.lastActiveAt,
  permissions: user.permissions || [],
  instances: user.instances || [],
  groups: user.groups || [],
  chatUserId: user.chatUserId,
  twoFactorEnabled: isTwoFactorEnabled(user),
});

export async function findOneUser(userId: string | null): Promise<MappedUser> {
  const user = await Users.findOneAsync(userId as string);
  return mapUser(user as AppUser);
}

export async function findUsersByPersonIds(
  personIds: string[]
): Promise<MappedUser[]> {
  const users = await Users.find({
    personId: { $in: personIds },
  }).fetchAsync();

  return users.map((user: AppUser) => mapUser(user));
}
