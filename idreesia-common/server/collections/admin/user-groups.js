import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { UserGroup as UserGroupSchema } from 'meteor/idreesia-common/server/schemas/admin';

class UserGroups extends AggregatableCollection {
  constructor(name = 'admin-user-groups', options = {}) {
    const userGroups = super(name, options);
    userGroups.attachSchema(UserGroupSchema);
    return userGroups;
  }
}

export default new UserGroups();
