import { Mongo } from 'meteor/mongo';

import { EmploymentEvent as EmploymentEventSchema } from 'meteor/idreesia-common/server/schemas/hr';

class EmploymentEvents extends Mongo.Collection {
  constructor(name = 'hr-employment-events', options = {}) {
    super(name, options);
    this.attachSchema(EmploymentEventSchema);
  }
}

export default new EmploymentEvents();
