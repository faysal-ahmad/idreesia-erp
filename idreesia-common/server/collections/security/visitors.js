import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Visitor as VisitorSchema } from 'meteor/idreesia-common/server/schemas/security';

class Visitors extends AggregatableCollection {
  constructor(name = 'security-visitors', options = {}) {
    const visitors = super(name, options);
    visitors.attachSchema(VisitorSchema);
    return visitors;
  }
}

export default new Visitors();
