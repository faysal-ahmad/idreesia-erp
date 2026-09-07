import agenda from 'meteor/idreesia-common/server/business-logic/jobs/agenda-instance';
import { setupJobDefinitions } from 'meteor/idreesia-common/server/business-logic/jobs/setup-job-definitions';
import { scheduleRecurringJobs } from 'meteor/idreesia-common/server/business-logic/jobs/recurring-schedule';

const jobsEnabled = process.env.JOBS_ENABLED === 'true';

export async function setupAgenda() {
  // Registers handlers (agenda.define()) and seeds/prunes JobDefinitions
  // regardless of jobsEnabled, same as the definitions/ side-effect import
  // this replaced - defining a handler doesn't make anything run, so the
  // Job Definitions page stays populated and editable even while the
  // processor itself is off.
  await setupJobDefinitions();

  if (!jobsEnabled) return;

  await agenda.start();
  await scheduleRecurringJobs();

  ['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, async () => {
      await agenda.stop();
      process.exit(0);
    });
  });
}
