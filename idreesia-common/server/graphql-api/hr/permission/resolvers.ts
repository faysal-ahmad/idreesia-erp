import {
  addGroupPermission,
  addPermissionUser,
  listPermissionAssignments,
  searchHrPermissionKarkuns,
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

interface RemoveArgs {
  permissionKey: string;
  userId: string;
}

export default {
  Query: {
    hrPermissionAssignments: async () => listPermissionAssignments(),

    hrPermissionKarkunSearch: async (
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
