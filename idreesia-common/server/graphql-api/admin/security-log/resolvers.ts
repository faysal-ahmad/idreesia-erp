import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

interface SecurityLogFilter {
  dataSource?: string | null;
  operationType?: string | null;
  userId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

interface PersonRecord {
  _id: string;
  sharedData?: {
    name?: string;
  };
}

interface AppUser {
  _id: string;
  username?: string;
  profile?: { name?: string };
  personId?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function toUserOptions(users: AppUser[]) {
  const personIds = users
    .map(user => user.personId)
    .filter((id): id is string => Boolean(id));
  const people = personIds.length
    ? ((await People.find(
        { _id: { $in: personIds } },
        { fields: { 'sharedData.name': 1 } }
      ).fetchAsync()) as PersonRecord[])
    : [];
  const nameByPersonId = new Map(
    people.map(person => [person._id, person.sharedData?.name])
  );

  return users.map(user => ({
    _id: user._id,
    name:
      (user.personId && nameByPersonId.get(user.personId)) ||
      user.profile?.name ||
      user.username ||
      user._id,
  }));
}

export default {
  Query: {
    pagedSecurityLogs: async (
      _obj: unknown,
      { filter }: { filter?: SecurityLogFilter }
    ) => {
      const { dataSource, operationType, userId, startTime, endTime, pageIndex, pageSize } =
        filter ?? {};
      return SecurityLogs.searchSecurityLogs({
        dataSources: dataSource ? [dataSource] : undefined,
        operationTypes: operationType ? [operationType] : undefined,
        userIds: userId ? [userId] : undefined,
        startDate: startTime ? new Date(startTime) : undefined,
        endDate: endTime ? new Date(endTime) : undefined,
        pageIndex: pageIndex ?? undefined,
        pageSize: pageSize ?? undefined,
      });
    },

    securityLogUsers: async (
      _obj: unknown,
      { search, ids }: { search?: string | null; ids?: string[] | null }
    ) => {
      if (ids && ids.length > 0) {
        const users = (await Users.find(
          { _id: { $in: ids } },
          { fields: { username: 1, profile: 1, personId: 1 } }
        ).fetchAsync()) as AppUser[];
        return toUserOptions(users);
      }

      const trimmed = search?.trim();
      if (!trimmed || trimmed.length < 2) return [];

      const regex = new RegExp(escapeRegExp(trimmed), 'i');
      const users = (await Users.find(
        {
          $or: [
            { username: regex },
            { 'profile.name': regex },
            { 'emails.address': regex },
          ],
        },
        { fields: { username: 1, profile: 1, personId: 1 }, limit: 20 }
      ).fetchAsync()) as AppUser[];
      return toUserOptions(users);
    },
  },
};
