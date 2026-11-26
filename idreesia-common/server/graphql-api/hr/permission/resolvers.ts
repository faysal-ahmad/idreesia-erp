import {
  addCommitteePermission,
  addGroupPermission,
  addPermissionUser,
  listPermissionAssignments,
  searchHrPermissionKarkuns,
  removeCommitteePermission,
  removeGroupPermission,
  removePermissionUser,
} from 'meteor/idreesia-common/server/business-logic/hr';

interface ResolverContext {
  user: { _id: string };
}

interface AddArgs {
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

export default {
  Query: {
    hrPermissionAssignments: async () => listPermissionAssignments(),

    pagedHrPermissionKarkuns: async (
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
    addHrPermissionCommittee: async (
      _obj: unknown,
      { permissionKey, committeeId }: CommitteeArgs,
      { user }: ResolverContext
    ) => addCommitteePermission(permissionKey, committeeId, user),

    removeHrPermissionCommittee: async (
      _obj: unknown,
      { permissionKey, committeeId }: CommitteeArgs,
      { user }: ResolverContext
    ) => removeCommitteePermission(permissionKey, committeeId, user),

    addHrPermissionUser: async (
      _obj: unknown,
      { permissionKey, karkunId }: AddArgs,
      { user }: ResolverContext
    ) => addPermissionUser(permissionKey, karkunId, user),

    removeHrPermissionUser: async (
      _obj: unknown,
      { permissionKey, userId }: RemoveArgs,
      { user }: ResolverContext
    ) => removePermissionUser(permissionKey, userId, user),

    addHrPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => addGroupPermission(groupId, permissionKey, user),

    removeHrPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => removeGroupPermission(groupId, permissionKey, user),
  },
};
