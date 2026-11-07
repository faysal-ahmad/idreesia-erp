import { People } from 'meteor/idreesia-common/server/collections/common';
import { getPersonRelationCounts } from 'meteor/idreesia-common/server/business-logic/admin';
import {
  getPersonImageUrls,
  type PersonImageFields,
} from 'meteor/idreesia-common/server/business-logic/common/person-images';

interface UserRef {
  _id: string;
}

export default {
  DuplicatePersonSummaryType: {
    imageUrl: (person: PersonImageFields) =>
      getPersonImageUrls(person).imageUrl,
    imageThumbnailUrl: (person: PersonImageFields) =>
      getPersonImageUrls(person).imageThumbnailUrl,
  },
  Query: {
    duplicateCnics: async () => People.findDuplicateCnics(),

    duplicatePhoneNumbers: async () => People.findDuplicatePhoneNumbers(),

    duplicatePersonById: async (_obj: unknown, { _id }: { _id: string }) =>
      People.findOneAsync(_id),

    duplicatePersonRelationCounts: async (
      _obj: unknown,
      { ids }: { ids: string[] }
    ) => {
      const countsByPersonId = await getPersonRelationCounts(ids);
      return ids.map(personId => ({
        personId,
        total: countsByPersonId[personId]?.total ?? 0,
        counts: countsByPersonId[personId]?.counts ?? [],
      }));
    },
  },

  Mutation: {
    deleteDuplicatePeople: async (
      _obj: unknown,
      { _ids }: { _ids: string[] },
      { user }: { user: UserRef }
    ) => {
      let count = 0;
      for (const _id of new Set(_ids.filter(Boolean))) {
        count += await People.removePerson(_id, user);
      }
      return count;
    },
  },
};
