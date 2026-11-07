import { Migrations } from 'meteor/quave:migrations';

import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';

const OLD_PERMISSION = 'hr-manage-setup-data';
const NEW_PERMISSION = 'hr-manage-karkuns-setup-data';

Migrations.add({
  version: 58,
  async up() {
    // HR_MANAGE_SETUP_DATA was renamed to HR_MANAGE_KARKUNS_SETUP_DATA (jobs
    // moved to the separate HR_MANAGE_EMPLOYEES_SETUP_DATA). Rewrite the stored
    // value on users and groups so existing grants carry over.
    // The positional `$` targets the matched array element (a permission only
    // appears once per document).
    const selector = { permissions: OLD_PERMISSION };
    const modifier = { $set: { 'permissions.$': NEW_PERMISSION } };
    await Users.updateAsync(selector, modifier, { multi: true });
    await UserGroups.updateAsync(selector, modifier, { multi: true });
  },
});
