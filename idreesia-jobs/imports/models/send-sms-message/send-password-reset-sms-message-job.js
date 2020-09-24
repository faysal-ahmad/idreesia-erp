import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class SendPasswordResetSmsMessageJob extends Job {
  constructor(data = {}) {
    super(JobTypes.SEND_PASSWORD_RESET_SMS_MESSAGE, data);
  }
}

export default SendPasswordResetSmsMessageJob;
