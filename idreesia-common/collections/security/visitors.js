import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { Visitor as VisitorSchema } from "meteor/idreesia-common/schemas/security";

class Visitors extends AggregatableCollection {
  constructor(name = "security-visitors", options = {}) {
    const visitors = super(name, options);
    visitors.attachSchema(VisitorSchema);
    return visitors;
  }
}

export default new Visitors();
