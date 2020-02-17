import { JobTypes } from 'meteor/idreesia-common/constants';
import Job from '../common/job';

class SendSmsMessageJob extends Job {
  constructor(data = {}) {
    super(JobTypes.SEND_SMS_MESSAGE, data);
  }
}

export default SendSmsMessageJob;
