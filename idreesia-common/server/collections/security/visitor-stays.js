import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VisitorStay as VisitorStaySchema } from 'meteor/idreesia-common/server/schemas/security';

class VisitorStays extends AggregatableCollection {
  constructor(name = 'security-visitor-stays', options = {}) {
    const visitorStays = super(name, options);
    visitorStays.attachSchema(VisitorStaySchema);
    return visitorStays;
  }
}

export default new VisitorStays();
