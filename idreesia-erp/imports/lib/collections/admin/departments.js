import { Mongo } from 'meteor/mongo';

import { Department as DepartmentSchema } from '/imports/lib/schemas/admin';

class Departments extends Mongo.Collection {
  constructor(name = 'admin-departments', options = {}) {
    const departments = super(name, options);
    departments.attachSchema(DepartmentSchema);
    return departments;
  }
}

export default new Departments();
