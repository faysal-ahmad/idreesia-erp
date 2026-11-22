import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { mapUser } from './users/map-user';

export interface OrgLocationUsersParams {
  locationId: string;
  pageIndex?: string | null;
  pageSize?: string | null;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * The user accounts of the karkuns whose mehfil is the location, a page at a
 * time and by username, in the same shape as the Users list.
 */
export async function listOrgLocationUsers({
  locationId,
  pageIndex,
  pageSize,
}: OrgLocationUsersParams) {
  const karkuns = await People.find(
    {
      isKarkun: true,
      'karkunData.mehfilLocationId': locationId,
      deletedAt: { $exists: false },
    },
    { fields: { _id: 1 } }
  ).fetchAsync();
  const selector = { personId: { $in: karkuns.map(karkun => karkun._id) } };

  const nPageIndex = Math.max(parseInt(pageIndex ?? '0', 10) || 0, 0);
  const nPageSize = Math.min(
    Math.max(parseInt(pageSize ?? '', 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  const [users, totalResults] = await Promise.all([
    Users.find(selector, {
      sort: { username: 1 },
      skip: nPageIndex * nPageSize,
      limit: nPageSize,
    }).fetchAsync(),
    Users.find(selector).countAsync(),
  ]);

  return { totalResults, data: users.map(user => mapUser(user)) };
}

export interface LinkableUsersParams {
  search?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Users who are people's accounts that no karkun has claimed yet.
const UNLINKED_USER_SELECTOR = {
  isServiceAccount: { $ne: true },
  personId: { $in: [null, ''] },
};

/**
 * The users that can be linked to a karkun: not service accounts, and with no
 * profile (karkun) linked, a page at a time and by username. `search` matches
 * the username, display name or email.
 */
export async function listLinkableUsers({
  search,
  pageIndex,
  pageSize,
}: LinkableUsersParams) {
  const nPageIndex = Math.max(parseInt(pageIndex ?? '0', 10) || 0, 0);
  const nPageSize = Math.min(
    Math.max(parseInt(pageSize ?? '', 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  const text = (search ?? '').trim();
  const selector: Record<string, unknown> = { ...UNLINKED_USER_SELECTOR };
  if (text) {
    const regex = { $regex: escapeRegex(text), $options: 'i' };
    selector.$or = [
      { username: regex },
      { 'profile.name': regex },
      { 'emails.address': regex },
    ];
  }

  const [users, totalResults] = await Promise.all([
    Users.find(selector, {
      sort: { username: 1 },
      skip: nPageIndex * nPageSize,
      limit: nPageSize,
    }).fetchAsync(),
    Users.find(selector).countAsync(),
  ]);

  return { totalResults, data: users.map(user => mapUser(user)) };
}

/**
 * Links an existing user account to a karkun of the mehfil. Fails when the
 * karkun is not of the mehfil or already has an account, or when the user is a
 * service account or already linked to a profile.
 */
export async function linkOrgLocationUser(
  locationId: string,
  karkunId: string,
  userId: string
) {
  const karkun = await People.findOneAsync({
    _id: karkunId,
    isKarkun: true,
    'karkunData.mehfilLocationId': locationId,
    deletedAt: { $exists: false },
  });
  if (!karkun) throw new Error('Karkun not found in this location.');

  if (await Users.findOneAsync({ personId: karkunId })) {
    throw new Error('This karkun already has a user account.');
  }

  // Conditional, so two admins linking the same user cannot both win.
  const updated = await Users.updateAsync(
    { _id: userId, ...UNLINKED_USER_SELECTOR },
    { $set: { personId: karkunId } }
  );
  if (!updated) {
    throw new Error('User not found, or it is already linked to a karkun.');
  }

  return mapUser((await Users.findOneAsync(userId))!);
}
