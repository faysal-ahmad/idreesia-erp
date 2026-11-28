import { DataSource } from 'meteor/idreesia-common/constants';
import {
  addStoreUserGroupMember,
  createStoreUserGroup,
  deleteStoreUserGroup,
  listStoreUserGroups,
  removeStoreUserGroupMember,
  searchStorePermissionKarkuns,
  updateStoreUserGroup,
} from 'meteor/idreesia-common/server/business-logic/inventory/store-access';

interface ResolverContext {
  user: { _id: string };
}

interface GroupArgs {
  name: string;
  description?: string | null;
}

export default {
  Query: {
    storeUserGroups: async () => listStoreUserGroups(),

    pagedStorePermissionKarkuns: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchStorePermissionKarkuns(args),
  },

  Mutation: {
    createStoreUserGroup: async (
      _obj: unknown,
      { name, description }: GroupArgs,
      { user }: ResolverContext
    ) => createStoreUserGroup({ name, description }, user),

    updateStoreUserGroup: async (
      _obj: unknown,
      { _id, name, description }: GroupArgs & { _id: string },
      { user }: ResolverContext
    ) => updateStoreUserGroup({ _id, name, description }, user),

    deleteStoreUserGroup: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => deleteStoreUserGroup(_id, user, DataSource.ADMIN),

    addStoreUserGroupMember: async (
      _obj: unknown,
      { groupId, karkunId }: { groupId: string; karkunId: string }
    ) => addStoreUserGroupMember(groupId, karkunId),

    removeStoreUserGroupMember: async (
      _obj: unknown,
      { groupId, userId }: { groupId: string; userId: string }
    ) => removeStoreUserGroupMember(groupId, userId),
  },
};
