import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VisitorStay as VisitorStaySchema } from 'meteor/idreesia-common/server/schemas/security';

class VisitorStays extends AggregatableCollection {
  constructor(name = 'security-visitor-stays', options = {}) {
    super(name, options);
    this.attachSchema(VisitorStaySchema);
  }
}

export default new VisitorStays();
