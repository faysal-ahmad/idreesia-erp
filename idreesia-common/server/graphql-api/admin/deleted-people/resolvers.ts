import { People } from 'meteor/idreesia-common/server/collections/common';

interface LooseRecord {
  [key: string]: any;
}

export default {
  Query: {
    pagedDeletedPeople: async (_obj: unknown, { filter }: { filter: LooseRecord }) =>
      People.searchPeople(filter, { onlyDeleted: true }),

    deletedPersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync(_id),
  },
};
