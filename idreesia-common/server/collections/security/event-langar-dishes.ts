import { Mongo } from 'meteor/mongo';

import { SecurityEventLangarDish as EventLangarDishSchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEventLangarDishes extends Mongo.Collection {
  constructor(name = 'security-event-langar-dishes', options = {}) {
    super(name, options);
    this.attachSchema(EventLangarDishSchema);
  }
}

export default new SecurityEventLangarDishes();
