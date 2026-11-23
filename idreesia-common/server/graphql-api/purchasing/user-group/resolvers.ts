import {
  addGroupMember,
  createUserGroup,
  deleteUserGroup,
  listUserGroups,
  removeGroupMember,
  updateUserGroup,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

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
    purchasingUserGroups: async () => listUserGroups(),

  },

  Mutation: {
    createPurchasingUserGroup: async (
      _obj: unknown,
      values: { name: string; description?: string },
      { user }: ResolverContext
    ) => createUserGroup(values, user),

    updatePurchasingUserGroup: async (
      _obj: unknown,
      values: { _id: string; name: string; description?: string },
      { user }: ResolverContext
    ) => updateUserGroup(values, user),

    deletePurchasingUserGroup: async (_obj: unknown, { _id }: { _id: string }) =>
      deleteUserGroup(_id),

    addPurchasingGroupMember: async (_obj: unknown, { groupId, karkunId }: AddMemberArgs) =>
      addGroupMember(groupId, karkunId),

    removePurchasingGroupMember: async (_obj: unknown, { groupId, userId }: RemoveMemberArgs) =>
      removeGroupMember(groupId, userId),
  },
};
