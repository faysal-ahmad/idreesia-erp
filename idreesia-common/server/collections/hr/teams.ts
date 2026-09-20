import { Mongo } from 'meteor/mongo';

import { Team as TeamSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Teams extends Mongo.Collection {
  constructor(name = 'hr-teams', options = {}) {
    super(name, options);
    this.attachSchema(TeamSchema);
  }
}

export default new Teams();
