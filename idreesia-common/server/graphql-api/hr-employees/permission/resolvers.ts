import {
  HR_EMPLOYEES_MODULE,
  addCommitteePermission,
  addGroupPermission,
  addPermissionUser,
  listPermissionAssignments,
  removeCommitteePermission,
  removeGroupPermission,
  removePermissionUser,
  searchHrPermissionKarkuns,
} from 'meteor/idreesia-common/server/business-logic/hr-common';

interface ResolverContext {
  user: { _id: string };
}

interface UserArgs {
  permissionKey: string;
  karkunId: string;
}

interface GroupArgs {
  permissionKey: string;
  groupId: string;
}

interface CommitteeArgs {
  permissionKey: string;
  committeeId: string;
}

interface RemoveArgs {
  permissionKey: string;
  userId: string;
}

const scope = HR_EMPLOYEES_MODULE;

export default {
  Query: {
    hrEmployeesPermissionAssignments: async () => listPermissionAssignments(scope),

    pagedHrEmployeesPermissionKarkuns: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchHrPermissionKarkuns(args),
  },

  Mutation: {
    addHrEmployeesPermissionUser: async (
      _obj: unknown,
      { permissionKey, karkunId }: UserArgs,
      { user }: ResolverContext
    ) => addPermissionUser(scope, permissionKey, karkunId, user),

    removeHrEmployeesPermissionUser: async (
      _obj: unknown,
      { permissionKey, userId }: RemoveArgs,
      { user }: ResolverContext
    ) => removePermissionUser(scope, permissionKey, userId, user),

    addHrEmployeesPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => addGroupPermission(scope, groupId, permissionKey, user),

    removeHrEmployeesPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => removeGroupPermission(scope, groupId, permissionKey, user),

    addHrEmployeesPermissionCommittee: async (
      _obj: unknown,
      { permissionKey, committeeId }: CommitteeArgs,
      { user }: ResolverContext
    ) => addCommitteePermission(scope, permissionKey, committeeId, user),

    removeHrEmployeesPermissionCommittee: async (
      _obj: unknown,
      { permissionKey, committeeId }: CommitteeArgs,
      { user }: ResolverContext
    ) => removeCommitteePermission(scope, permissionKey, committeeId, user),
  },
};
