import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class SendAccountCreatedSmsMessageJob extends Job {
  constructor(data = {}) {
    super(JobTypes.SEND_ACCOUNT_CREATED_SMS_MESSAGE, data);
  }
}

export default SendAccountCreatedSmsMessageJob;
