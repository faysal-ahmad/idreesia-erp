import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { UserGroup as UserGroupSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface UserGroupDocument {
  _id?: string;
  name: string;
  moduleName?: string;
  description?: string;
  permissions?: string[];
  instances?: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class UserGroups extends AggregatableCollection<UserGroupDocument> {
  constructor(name = 'user-groups', options = {}) {
    super(name, options);
    this.attachSchema(UserGroupSchema);
  }
}

export default new UserGroups();
