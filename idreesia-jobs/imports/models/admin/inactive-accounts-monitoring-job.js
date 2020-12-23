import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class InactiveAccountsMonitoringJob extends Job {
  constructor(data = {}) {
    super(JobTypes.INACTIVE_ACCOUNTS_MONITORING_JOB, data);
  }
}

export default InactiveAccountsMonitoringJob;
