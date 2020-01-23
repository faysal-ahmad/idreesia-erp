import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityGroupUser as SecurityGroupUserSchema } from 'meteor/idreesia-common/server/schemas/admin';

class SecurityGroupUsers extends AggregatableCollection {
  constructor(name = 'admin-security-group-users', options = {}) {
    const securityGroupUsers = super(name, options);
    securityGroupUsers.attachSchema(SecurityGroupUserSchema);
    return securityGroupUsers;
  }
}

export default new SecurityGroupUsers();
