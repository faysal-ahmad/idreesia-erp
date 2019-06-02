import { assign } from "lodash";

import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { Visitor as VisitorModel } from "meteor/idreesia-common/models/security";
import { Visitor as VisitorSchema } from "meteor/idreesia-common/schemas/security";

class Visitors extends AggregatableCollection {
  constructor(name = "security-visitors", options = {}) {
    const visitors = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new VisitorModel(doc);
        }
      })
    );

    visitors.attachSchema(VisitorSchema);
    return visitors;
  }
}

export default new Visitors();
