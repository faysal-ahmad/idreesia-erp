import { Migrations } from 'meteor/quave:migrations';

import {
  UserGroups,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';

const PERMISSION_RENAMES: Record<string, string> = {
  'inventory-manage-setup-data': 'stores-manage-setup-data',
  'inventory-manage-stock-items': 'stores-manage-stock-items',
  'inventory-view-stock-adjustments': 'stores-view-stock-adjustments',
  'inventory-manage-stock-adjustments': 'stores-manage-stock-adjustments',
  'inventory-approve-stock-adjustments': 'stores-approve-stock-adjustments',
  'inventory-view-issuance-forms': 'stores-view-issuance-forms',
  'inventory-manage-issuance-forms': 'stores-manage-issuance-forms',
  'inventory-approve-issuance-forms': 'stores-approve-issuance-forms',
  'inventory-view-purchase-forms': 'stores-view-purchase-forms',
  'inventory-manage-purchase-forms': 'stores-manage-purchase-forms',
  'inventory-approve-purchase-forms': 'stores-approve-purchase-forms',
};

const renamePermissions = (permissions: string[] = []): string[] =>
  permissions.map(permission => PERMISSION_RENAMES[permission] ?? permission);

Migrations.add({
  version: 45,
  async up() {
    await UserGroups.updateAsync(
      { moduleName: 'Inventory' },
      { $set: { moduleName: 'Stores' } },
      { multi: true }
    );

    const groups = await UserGroups.find({
      permissions: { $in: Object.keys(PERMISSION_RENAMES) },
    }).fetchAsync();
    for (const group of groups) {
      await UserGroups.updateAsync(group._id!, {
        $set: { permissions: renamePermissions(group.permissions) },
      });
    }

    const users = await Users.find({
      permissions: { $in: Object.keys(PERMISSION_RENAMES) },
    }).fetchAsync();
    for (const user of users) {
      await Users.updateAsync(user._id, {
        $set: {
          permissions: renamePermissions(user.permissions),
        },
      });
    }
  },
});
