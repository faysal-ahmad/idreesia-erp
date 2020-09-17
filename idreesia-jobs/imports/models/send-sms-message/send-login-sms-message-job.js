import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class SendLoginSmsMessageJob extends Job {
  constructor(data = {}) {
    super(JobTypes.SEND_LOGIN_SMS_MESSAGE, data);
  }
}

export default SendLoginSmsMessageJob;
