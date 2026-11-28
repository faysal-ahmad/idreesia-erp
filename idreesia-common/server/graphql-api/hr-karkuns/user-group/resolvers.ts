import {
  HR_KARKUNS_MODULE,
  addGroupMember,
  createUserGroup,
  deleteUserGroup,
  listUserGroups,
  removeGroupMember,
  updateUserGroup,
} from 'meteor/idreesia-common/server/business-logic/hr-common';

interface ResolverContext {
  user: { _id: string };
}

interface AddMemberArgs {
  groupId: string;
  karkunId: string;
}

interface RemoveMemberArgs {
  groupId: string;
  userId: string;
}

const scope = HR_KARKUNS_MODULE;

export default {
  Query: {
    hrKarkunsUserGroups: async () => listUserGroups(scope),
  },

  Mutation: {
    createHrKarkunsUserGroup: async (
      _obj: unknown,
      values: { name: string; description?: string },
      { user }: ResolverContext
    ) => createUserGroup(scope, values, user),

    updateHrKarkunsUserGroup: async (
      _obj: unknown,
      values: { _id: string; name: string; description?: string },
      { user }: ResolverContext
    ) => updateUserGroup(scope, values, user),

    deleteHrKarkunsUserGroup: async (_obj: unknown, { _id }: { _id: string }) =>
      deleteUserGroup(scope, _id),

    addHrKarkunsGroupMember: async (_obj: unknown, { groupId, karkunId }: AddMemberArgs) =>
      addGroupMember(scope, groupId, karkunId),

    removeHrKarkunsGroupMember: async (_obj: unknown, { groupId, userId }: RemoveMemberArgs) =>
      removeGroupMember(scope, groupId, userId),
  },
};
