import { searchSecurityPermissionKarkuns } from 'meteor/idreesia-common/server/business-logic/security/permission-karkuns';
import {
  addPermissionUser,
  listPermissionAssignments,
  removePermissionUser,
} from 'meteor/idreesia-common/server/business-logic/security/permissions';
import {
  addGroupPermission,
  removeGroupPermission,
} from 'meteor/idreesia-common/server/business-logic/security/user-groups';

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
    securityPermissionAssignments: async () => listPermissionAssignments(),

    pagedSecurityPermissionKarkuns: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchSecurityPermissionKarkuns(args),
  },

  Mutation: {
    addSecurityPermissionUser: async (
      _obj: unknown,
      { permissionKey, karkunId }: AddArgs,
      { user }: ResolverContext
    ) => addPermissionUser(permissionKey, karkunId, user),

    removeSecurityPermissionUser: async (
      _obj: unknown,
      { permissionKey, userId }: RemoveArgs,
      { user }: ResolverContext
    ) => removePermissionUser(permissionKey, userId, user),

    addSecurityPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => addGroupPermission(groupId, permissionKey, user),

    removeSecurityPermissionGroup: async (
      _obj: unknown,
      { permissionKey, groupId }: GroupArgs,
      { user }: ResolverContext
    ) => removeGroupPermission(groupId, permissionKey, user),
  },
};
