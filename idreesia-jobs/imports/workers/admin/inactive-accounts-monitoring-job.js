import moment from 'moment';
import { Accounts } from 'meteor/accounts-base';
import {
  DataSource,
  Formats,
  JobTypes,
} from 'meteor/idreesia-common/constants';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import Jobs from '/imports/collections/jobs';

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Disabling inactive accounts`);

  try {
    const adminUser = Accounts.findUserByUsername('erp-admin');
    const users = Users.find({}).fetch();
    // Iterate through all the users and lock the accounts that
    // have not been active for 30 days.
    users.forEach(user => {
      if (!user.locked) {
        const lastActiveAt = user.lastActiveAt || user.createdAt;
        const diff = moment().diff(
          moment(lastActiveAt, Formats.DATE_FORMAT),
          'days'
        );
        if (diff > 30) {
          Users.lockAccount({ userId: user._id }, adminUser, DataSource.JOBS);
        }
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    // eslint-disable-next-line no-console
    console.log(`--> Disabling inactive accounts completed`);
    job.done();
    if (callback) {
      callback();
    }
  }
};

export default Jobs.processJobs(
  JobTypes.INACTIVE_ACCOUNTS_MONITORING_JOB,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 10 * 1000,
  },
  worker
);
