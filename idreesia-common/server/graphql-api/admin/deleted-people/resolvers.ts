import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  getPersonRelationCounts,
  hasNonOwnedRelations,
  removeOwnedPersonRelations,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface LooseRecord {
  [key: string]: any;
}

interface UserRef {
  _id: string;
}

export default {
  Query: {
    pagedDeletedPeople: async (_obj: unknown, { filter }: { filter: LooseRecord }) =>
      People.searchPeople(filter, { onlyDeleted: true }),

    deletedPersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync(_id),

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
      if (ids.length === 0) return 0;

      // Skip anyone who isn't soft deleted or still has data records that
      // are not owned by them - only the rest of the batch is removed.
      const deletedPeople = await People.find(
        { _id: { $in: ids }, deletedAt: { $exists: true } },
        { fields: { _id: 1 } }
      ).fetchAsync();
      const deletedIds: string[] = deletedPeople.map(
        (person: { _id: string }) => person._id
      );
      const countsByPersonId = await getPersonRelationCounts(deletedIds);
      const deletableIds = deletedIds.filter(
        _id => !hasNonOwnedRelations(countsByPersonId[_id]?.counts ?? [])
      );

      let count = 0;
      for (const _id of deletableIds) {
        await removeOwnedPersonRelations(_id);
        count += await People.hardRemovePerson(_id, user);
      }
      return count;
    },

    restorePerson: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: { user: UserRef }
    ) => People.restorePerson(_id, user),
  },
};
