import {
  addGroupMember,
  createUserGroup,
  deleteUserGroup,
  listUserGroups,
  removeGroupMember,
  updateUserGroup,
} from 'meteor/idreesia-common/server/business-logic/security/user-groups';

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
    securityUserGroups: async () => listUserGroups(),

  },

  Mutation: {
    createSecurityUserGroup: async (
      _obj: unknown,
      values: { name: string; description?: string },
      { user }: ResolverContext
    ) => createUserGroup(values, user),

    updateSecurityUserGroup: async (
      _obj: unknown,
      values: { _id: string; name: string; description?: string },
      { user }: ResolverContext
    ) => updateUserGroup(values, user),

    deleteSecurityUserGroup: async (_obj: unknown, { _id }: { _id: string }) =>
      deleteUserGroup(_id),

    addSecurityGroupMember: async (_obj: unknown, { groupId, karkunId }: AddMemberArgs) =>
      addGroupMember(groupId, karkunId),

    removeSecurityGroupMember: async (_obj: unknown, { groupId, userId }: RemoveMemberArgs) =>
      removeGroupMember(groupId, userId),
  },
};
