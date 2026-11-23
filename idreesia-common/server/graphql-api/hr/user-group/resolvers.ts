import {
  addGroupMember,
  createUserGroup,
  deleteUserGroup,
  listUserGroups,
  removeGroupMember,
  updateUserGroup,
} from 'meteor/idreesia-common/server/business-logic/hr';

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

export default {
  Query: {
    hrUserGroups: async () => listUserGroups(),

  },

  Mutation: {
    createHrUserGroup: async (
      _obj: unknown,
      values: { name: string; description?: string },
      { user }: ResolverContext
    ) => createUserGroup(values, user),

    updateHrUserGroup: async (
      _obj: unknown,
      values: { _id: string; name: string; description?: string },
      { user }: ResolverContext
    ) => updateUserGroup(values, user),

    deleteHrUserGroup: async (_obj: unknown, { _id }: { _id: string }) =>
      deleteUserGroup(_id),

    addHrGroupMember: async (_obj: unknown, { groupId, karkunId }: AddMemberArgs) =>
      addGroupMember(groupId, karkunId),

    removeHrGroupMember: async (_obj: unknown, { groupId, userId }: RemoveMemberArgs) =>
      removeGroupMember(groupId, userId),
  },
};
