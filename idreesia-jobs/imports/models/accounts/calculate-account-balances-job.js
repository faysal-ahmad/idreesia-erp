import * as JOB_TYPES from "imports/constants/job-types";
import Job from "../common/job";

class CalculateAccountBalancesJob extends Job {
  constructor(data = {}) {
    super(JOB_TYPES.CALCULATE_ACCOUNT_BALANCES, data);
  }
}

export default CalculateAccountBalancesJob;
