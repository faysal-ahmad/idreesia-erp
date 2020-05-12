import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class CheckSubscriptionStatusJob extends Job {
  constructor(data = {}) {
    super(JobTypes.CHECK_SUBSCRIPTION_STATUS, data);
  }
}

export default CheckSubscriptionStatusJob;
