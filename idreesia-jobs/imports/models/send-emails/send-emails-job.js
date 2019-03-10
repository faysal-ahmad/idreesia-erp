import { JobTypes } from "meteor/idreesia-common/constants";
import Job from "../common/job";

class SendEmailsJob extends Job {
  constructor(data = {}) {
    super(JobTypes.SEND_EMAILS, data);
  }
}

export default SendEmailsJob;
