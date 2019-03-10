import { JobTypes } from "meteor/idreesia-common/constants";
import Job from "../common/job";

class AccountsCalculationJob extends Job {
  constructor(data = {}) {
    super(JobTypes.ACCOUNTS_CALCULATION, data);
  }
}

export default AccountsCalculationJob;
