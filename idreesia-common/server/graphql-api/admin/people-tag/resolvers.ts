import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';

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
    ) => PeopleTags.createTag(params, user),

    updatePeopleTag: async (
      _obj: unknown,
      params: PeopleTagArgs,
      { user }: ResolverContext
    ) => PeopleTags.updateTag(params, user),

    deletePeopleTag: async (
      _obj: unknown,
      { _id }: Pick<PeopleTagArgs, '_id'>
    ) => PeopleTags.removeTag({ _id }),
  },
};
