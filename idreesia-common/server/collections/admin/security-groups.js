import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityGroup as SecurityGroupSchema } from 'meteor/idreesia-common/server/schemas/admin';

class SecurityGroups extends AggregatableCollection {
  constructor(name = 'admin-security-groups', options = {}) {
    const securityGroups = super(name, options);
    securityGroups.attachSchema(SecurityGroupSchema);
    return securityGroups;
  }
}

export default new SecurityGroups();
