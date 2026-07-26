import { Mongo } from 'meteor/mongo';

import { MehfilLangarDish as MehfilLangarDishSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarDishes extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-dishes', options = {}) {
    super(name, options);
    this.attachSchema(MehfilLangarDishSchema);
  }
}

export default new MehfilLangarDishes();
