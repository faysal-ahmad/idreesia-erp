import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Salary as SalarySchema } from 'meteor/idreesia-common/server/schemas/hr';

class Salaries extends AggregatableCollection {
  constructor(name = 'hr-salaries', options = {}) {
    const salaries = super(name, options);
    salaries.attachSchema(SalarySchema);
    return salaries;
  }
}

export default new Salaries();
