import { People } from 'meteor/idreesia-common/server/collections/common';

export default {
  Query: {
    duplicateCnics: async () => People.findDuplicateCnics(),

    duplicatePhoneNumbers: async () => People.findDuplicatePhoneNumbers(),

    duplicatePersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync(_id),
  },
};
