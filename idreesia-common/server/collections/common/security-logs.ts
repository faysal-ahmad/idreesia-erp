import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityLog as SecurityLogSchema } from 'meteor/idreesia-common/server/schemas/common';

export interface SecurityLogDocument {
  _id?: string;
  userId?: string | null;
  groupId?: string | null;
  committeeId?: string | null;
  operationType: string;
  operationDetails?: Record<string, unknown>;
  operationTime: Date;
  operationBy?: string;
  dataSource: string;
  dataSourceDetail?: string | null;
}

class SecurityLogs extends AggregatableCollection<SecurityLogDocument> {
  constructor(name = 'common-security-log', options = {}) {
    super(name, options);
    this.attachSchema(SecurityLogSchema);
  }
}

export default new SecurityLogs();
