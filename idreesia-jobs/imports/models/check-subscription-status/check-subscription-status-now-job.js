import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class CheckSubscriptionStatusNowJob extends Job {
  constructor(data = {}) {
    super(JobTypes.CHECK_SUBSCRIPTION_STATUS_NOW, data);
  }
}

export default CheckSubscriptionStatusNowJob;
