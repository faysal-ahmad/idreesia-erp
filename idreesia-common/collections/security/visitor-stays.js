import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { VisitorStay as VisitorStaySchema } from "meteor/idreesia-common/schemas/security";

class VisitorStays extends AggregatableCollection {
  constructor(name = "security-visitor-stays", options = {}) {
    const visitorStays = super(name, options);
    visitorStays.attachSchema(VisitorStaySchema);
    return visitorStays;
  }
}

export default new VisitorStays();
