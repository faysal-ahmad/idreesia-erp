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
    hardDeletePerson: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: { user: UserRef }
    ) => {
      const countsByPersonId = await getPersonRelationCounts([_id]);
      const counts = countsByPersonId[_id]?.counts ?? [];
      if (hasNonOwnedRelations(counts)) {
        throw new Error(
          'This person cannot be hard deleted because they have data records that are not owned by them.'
        );
      }

      await removeOwnedPersonRelations(_id);
      return People.hardRemovePerson(_id, user);
    },

    restorePerson: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: { user: UserRef }
    ) => People.restorePerson(_id, user),
  },
};
