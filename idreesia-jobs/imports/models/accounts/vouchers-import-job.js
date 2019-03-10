import { JobTypes } from "meteor/idreesia-common/constants";

import Job from "../common/job";

class VouchersImportJob extends Job {
  constructor(data = {}) {
    super(JobTypes.VOUCHERS_IMPORT, data);
  }
}

export default VouchersImportJob;
