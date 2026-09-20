import { People } from 'meteor/idreesia-common/server/collections/common';

interface UserRef {
  _id: string;
}

export default {
  Query: {
    duplicateCnics: async () => People.findDuplicateCnics(),

    duplicatePhoneNumbers: async () => People.findDuplicatePhoneNumbers(),

    duplicatePersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync(_id),
  },

  Mutation: {
    deleteDuplicatePerson: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: { user: UserRef }
    ) => People.removePerson(_id, user),
  },
};
