import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityLog as SecurityLogSchema } from 'meteor/idreesia-common/server/schemas/common';

class SecurityLogs extends AggregatableCollection {
  constructor(name = 'common-security-log', options = {}) {
    const securityLogs = super(name, options);
    securityLogs.attachSchema(SecurityLogSchema);
    return securityLogs;
  }
}

export default new SecurityLogs();
