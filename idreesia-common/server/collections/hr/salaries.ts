import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Salary as SalarySchema } from 'meteor/idreesia-common/server/schemas/hr';

class Salaries extends AggregatableCollection {
  constructor(name = 'hr-salaries', options = {}) {
    super(name, options);
    this.attachSchema(SalarySchema);
  }
}

export default new Salaries();
