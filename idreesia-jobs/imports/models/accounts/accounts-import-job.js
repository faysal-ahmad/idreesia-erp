import { JobTypes } from "meteor/idreesia-common/constants/job-types";

import Job from "../common/job";

class AccountsImportJob extends Job {
  constructor(data = {}) {
    super(JobTypes.ACCOUNTS_IMPORT, data);
  }
}

export default AccountsImportJob;
