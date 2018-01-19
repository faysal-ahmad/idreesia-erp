import { Mongo } from 'meteor/mongo';

import { Person as PersonSchema } from '../../schemas/admin';

class People extends Mongo.Collection {
  constructor(name = 'admin-people', options = {}) {
    const people = super(name, options);
    people.attachSchema(PersonSchema);
    return people;
  }
}

export default new People();
