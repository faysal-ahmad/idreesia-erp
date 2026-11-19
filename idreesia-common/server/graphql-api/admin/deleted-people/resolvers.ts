import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  getPersonRelationCounts,
  hardDeletePerson,
} from 'meteor/idreesia-common/server/business-logic/admin';
import {
  restorePerson,
  searchPeople,
} from 'meteor/idreesia-common/server/business-logic/common';

interface LooseRecord {
  [key: string]: any;
}

interface UserRef {
  _id: string;
}

export default {
  Query: {
    pagedDeletedPeople: async (_obj: unknown, { filter }: { filter: LooseRecord }) =>
      searchPeople(filter, { onlyDeleted: true }),

    deletedPersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync({ _id, deletedAt: { $exists: true } }),

    deletedPersonRelationCounts: async (_obj: unknown, { ids }: { ids: string[] }) => {
      const countsByPersonId = await getPersonRelationCounts(ids);
      return ids.map(personId => ({
        personId,
        total: countsByPersonId[personId]?.total ?? 0,
        counts: countsByPersonId[personId]?.counts ?? [],
      }));
    },
  },

  Mutation: {
    hardDeletePeople: async (
      _obj: unknown,
      { _ids }: { _ids: string[] },
      { user }: { user: UserRef }
    ) => {
      const ids = Array.from(new Set(_ids.filter(Boolean)));

      // Each person is deleted in a transaction of their own. Anyone who
      // isn't soft deleted or still has data records that are not owned by
      // them is skipped - only the rest of the batch is removed.
      let count = 0;
      for (const _id of ids) {
        count += await hardDeletePerson(_id, user);
      }
      return count;
    },

    restorePerson: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: { user: UserRef }
    ) => restorePerson(_id, user),
  },
};
