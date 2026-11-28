import { Permissions } from 'meteor/idreesia-common/constants';
import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';

/**
 * What the logged-in user may do under Stores / Administration / Manage
 * Stores: create and edit stores (Manage Physical Stores), and give
 * permissions on them and manage the Stores user groups (either permission).
 * Only decides what the UI offers; the server enforces the same.
 */
const useManageStoresAccess = () => {
  const { user } = useLoggedInUser();
  const held = (permission: string) =>
    !!user && (!!user.isSuperAdmin || (user.permissions ?? []).includes(permission));
  const canManageStores = held(Permissions.IN_MANAGE_PHYSICAL_STORES);
  const canManagePermissions =
    canManageStores || held(Permissions.IN_MANAGE_PHYSICAL_STORE_PERMISSIONS);
  return { canManageStores, canManagePermissions };
};

export default useManageStoresAccess;
