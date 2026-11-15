import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';
import {
  createPeopleTag,
  removePeopleTag,
  updatePeopleTag,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface UserRef {
  _id: string;
}

interface ResolverContext {
  user: UserRef;
}

interface PeopleTagArgs {
  _id: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: string[];
}

export default {
  Query: {
    allPeopleTags: async () =>
      PeopleTags.find({}, { sort: { name: 1 } }).fetchAsync(),
  },

  Mutation: {
    createPeopleTag: async (
      _obj: unknown,
      params: Omit<PeopleTagArgs, '_id'>,
      { user }: ResolverContext
    ) => createPeopleTag(params, user),

    updatePeopleTag: async (
      _obj: unknown,
      params: PeopleTagArgs,
      { user }: ResolverContext
    ) => updatePeopleTag(params, user),

    deletePeopleTag: async (
      _obj: unknown,
      { _id }: Pick<PeopleTagArgs, '_id'>
    ) => removePeopleTag({ _id }),
  },
};
