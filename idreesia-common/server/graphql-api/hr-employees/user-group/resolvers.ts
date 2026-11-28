import {
  HR_EMPLOYEES_MODULE,
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

const scope = HR_EMPLOYEES_MODULE;

export default {
  Query: {
    hrEmployeesUserGroups: async () => listUserGroups(scope),
  },

  Mutation: {
    createHrEmployeesUserGroup: async (
      _obj: unknown,
      values: { name: string; description?: string },
      { user }: ResolverContext
    ) => createUserGroup(scope, values, user),

    updateHrEmployeesUserGroup: async (
      _obj: unknown,
      values: { _id: string; name: string; description?: string },
      { user }: ResolverContext
    ) => updateUserGroup(scope, values, user),

    deleteHrEmployeesUserGroup: async (_obj: unknown, { _id }: { _id: string }) =>
      deleteUserGroup(scope, _id),

    addHrEmployeesGroupMember: async (_obj: unknown, { groupId, karkunId }: AddMemberArgs) =>
      addGroupMember(scope, groupId, karkunId),

    removeHrEmployeesGroupMember: async (_obj: unknown, { groupId, userId }: RemoveMemberArgs) =>
      removeGroupMember(scope, groupId, userId),
  },
};
