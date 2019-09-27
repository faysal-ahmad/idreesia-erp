import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AdminJob as AdminJobSchema } from 'meteor/idreesia-common/server/schemas/admin';

class AdminJobs extends AggregatableCollection {
  constructor(name = 'admin-admin-jobs', options = {}) {
    const adminJobs = super(name, options);
    adminJobs.attachSchema(AdminJobSchema);
    return adminJobs;
  }
}

export default new AdminJobs();
