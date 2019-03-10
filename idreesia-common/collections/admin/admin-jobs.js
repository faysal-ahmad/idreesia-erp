import { AggregatableCollection } from "meteor/idreesia-common/collections";

import { AdminJob as AdminJobSchema } from "../../schemas/admin";

class AdminJobs extends AggregatableCollection {
  constructor(name = "admin-admin-jobs", options = {}) {
    const adminJobs = super(name, options);
    adminJobs.attachSchema(AdminJobSchema);
    return adminJobs;
  }
}

export default new AdminJobs();
