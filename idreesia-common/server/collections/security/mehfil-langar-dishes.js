import { Mongo } from 'meteor/mongo';

import { MehfilLangarDish as MehfilLangarDishSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarDishes extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-dishes', options = {}) {
    const mehfilLangarDishes = super(name, options);
    mehfilLangarDishes.attachSchema(MehfilLangarDishSchema);
    return mehfilLangarDishes;
  }
}

export default new MehfilLangarDishes();
