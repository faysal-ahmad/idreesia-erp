import * as JOB_TYPES from "imports/constants/job-types";
import Job from "../common/job";

class SendEmailsJob extends Job {
  constructor(data = {}) {
    super(JOB_TYPES.SEND_EMAILS, data);
  }
}

export default SendEmailsJob;
