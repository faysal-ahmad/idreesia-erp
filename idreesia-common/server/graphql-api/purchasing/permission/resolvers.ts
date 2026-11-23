import {
  addGroupPermission,
  addPermissionUser,
  listPermissionAssignments,
  searchPurchasingKarkuns,
  removeGroupPermission,
  removePermissionUser,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

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
    purchasingPermissionAssignments: async () => listPermissionAssignments(),

    purchasingKarkunSearch: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchPurchasingKarkuns(args),
  },

  Mutation: {
    addPurchasingPermissionUser: async (
      _obj: unknown,
      { permissionKey, karkunId }: AddArgs,
      { user }: ResolverContext
    ) => addPermissionUser(permissionKey, karkunId, user),

    removePurchasingPermissionUser: async (
      _obj: unknown,
      { permissionKey, userId }: RemoveArgs,
      { user }: ResolverContext
    ) => removePermissionUser(permissionKey, userId, user),

    addPurchasingPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => addGroupPermission(groupId, permissionKey, user),

    removePurchasingPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => removeGroupPermission(groupId, permissionKey, user),
  },
};
