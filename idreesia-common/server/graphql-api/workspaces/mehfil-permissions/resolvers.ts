import {
  addMehfilPermissionUser,
  listMehfilPermissions,
  listMyMehfilPermissionsLocations,
  loadMehfilPermissionsAccess,
  removeMehfilPermissionUser,
  searchMehfilPermissionsKarkuns,
} from 'meteor/idreesia-common/server/business-logic/mehfil-permissions';

interface Context {
  user: { _id: string; locked?: boolean; isSuperAdmin?: boolean };
}

interface PermissionArgs {
  locationId: string;
  featureKey: string;
  permissionKey: string;
}

// Who may call each field is declared in the schema with
// @checkMehfilPermissionsAccess.
export default {
  Query: {
    myMehfilPermissionsLocations: async (
      _obj: unknown,
      _args: unknown,
      { user }: Context
    ) => listMyMehfilPermissionsLocations(user),

    workspaceMehfilPermissions: async (
      _obj: unknown,
      { locationId }: { locationId: string },
      { user }: Context
    ) => ({
      locationId,
      permissions: await loadMehfilPermissionsAccess(user, locationId),
      groups: await listMehfilPermissions(locationId),
    }),

    workspaceMehfilPermissionsKarkunSearch: async (
      _obj: unknown,
      params: {
        locationId: string;
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchMehfilPermissionsKarkuns(params),
  },

  Mutation: {
    workspaceAddMehfilPermissionUser: async (
      _obj: unknown,
      args: PermissionArgs & { karkunId: string },
      { user }: Context
    ) =>
      addMehfilPermissionUser(
        args.locationId,
        args.featureKey,
        args.permissionKey,
        args.karkunId,
        user._id
      ),

    workspaceRemoveMehfilPermissionUser: async (
      _obj: unknown,
      args: PermissionArgs & { userId: string },
      { user }: Context
    ) =>
      removeMehfilPermissionUser(
        args.locationId,
        args.featureKey,
        args.permissionKey,
        args.userId,
        user._id
      ),
  },
};
