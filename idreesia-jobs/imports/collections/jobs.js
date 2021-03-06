import { JobCollection } from 'meteor/vsivsi:job-collection';
import { isNil } from 'meteor/idreesia-common/utilities/lodash';
import { JobTypes } from 'meteor/idreesia-common/constants';
import {
  CleanupJob,
  SendEmailsJob,
  SendSmsMessageJob,
  SendLoginSmsMessageJob,
  SendPasswordResetSmsMessageJob,
  SendAccountCreatedSmsMessageJob,
  AccountsImportJob,
  VouchersImportJob,
  AccountsCalculationJob,
  CheckSubscriptionStatusJob,
  CheckSubscriptionStatusNowJob,
  InactiveAccountsMonitoringJob,
} from '/imports/models';

const JobModels = {
  [JobTypes.CLEANUP_JOB]: CleanupJob,
  [JobTypes.SEND_EMAILS]: SendEmailsJob,
  [JobTypes.SEND_SMS_MESSAGE]: SendSmsMessageJob,
  [JobTypes.SEND_LOGIN_SMS_MESSAGE]: SendLoginSmsMessageJob,
  [JobTypes.SEND_PASSWORD_RESET_SMS_MESSAGE]: SendPasswordResetSmsMessageJob,
  [JobTypes.SEND_ACCOUNT_CREATED_SMS_MESSAGE]: SendAccountCreatedSmsMessageJob,
  [JobTypes.ACCOUNTS_IMPORT]: AccountsImportJob,
  [JobTypes.VOUCHERS_IMPORT]: VouchersImportJob,
  [JobTypes.ACCOUNTS_CALCULATION]: AccountsCalculationJob,
  [JobTypes.CHECK_SUBSCRIPTION_STATUS]: CheckSubscriptionStatusJob,
  [JobTypes.CHECK_SUBSCRIPTION_STATUS_NOW]: CheckSubscriptionStatusNowJob,
  [JobTypes.INACTIVE_ACCOUNTS_MONITORING_JOB]: InactiveAccountsMonitoringJob,
};

class Jobs extends JobCollection {
  constructor(name = 'jobs', options = {}) {
    super(name, options);
  }

  create(type, params = {}, options = {}) {
    if (!JobModels[type]) {
      throw new Meteor.Error('not-found', 'Job type could not be found.', {
        type,
      });
    }
    const job = new JobModels[type](params);
    const { priority, retry, repeat, delay } = options;

    if (!isNil(priority)) job.priority(priority);
    if (!isNil(retry)) job.retry(retry);
    if (!isNil(repeat)) job.repeat(repeat);
    if (!isNil(delay)) job.delay(delay);

    job.save();

    return job._doc._id;
  }

  cancel(selector) {
    const job = this.findOne(selector);
    if (job) job.cancel();
  }
}

export default new Jobs();
