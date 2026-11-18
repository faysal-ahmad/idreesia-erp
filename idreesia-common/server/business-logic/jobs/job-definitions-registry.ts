import type { Job } from 'agenda';
import { addMonths, format, startOfMonth } from 'date-fns';

import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';
import { backfillImageVectorData } from 'meteor/idreesia-common/server/business-logic/common/backfill-image-vector-data';
import { publishExpiringLockNotifications } from 'meteor/idreesia-common/server/business-logic/dms';
import { purgeNotifications } from 'meteor/idreesia-common/server/headless';
import { createTodayDayRecords } from 'meteor/idreesia-common/server/business-logic/duties-attendance';
import { createTodayDutyDayAttendances } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';
import { getSystemUser } from './system-user';
import { createProgressReporter } from './report-progress';

export interface JobDefinitionSeed {
  name: string;
  displayName: string;
  // Omit for a manual-only job - one that only ever runs via Run Now and is
  // never registered as a recurring job.
  defaultSchedule?: string;
  handler: (agendaJob: Job) => Promise<void>;
}

// Adding a new job is: one new entry here. The handler itself is never
// persisted to Mongo (it's code, not data) - only name/displayName/
// defaultSchedule get seeded into the JobDefinitions collection by
// setupJobDefinitions(); the handler is re-registered via agenda.define()
// from this same array on every boot.
const JOB_DEFINITIONS_REGISTRY: JobDefinitionSeed[] = [
  {
    name: 'create-monthly-salaries',
    displayName: 'Create Monthly Salaries',
    defaultSchedule: '0 2 1 * *',
    handler: async agendaJob => {
      const systemUser = await getSystemUser();
      const currentMonth = startOfMonth(new Date());
      const formattedCurrentMonth = format(currentMonth, 'MM-yyyy');
      const formattedPreviousMonth = format(
        addMonths(currentMonth, -1),
        'MM-yyyy'
      );
      await createMonthlySalaries(
        formattedCurrentMonth,
        formattedPreviousMonth,
        systemUser,
        createProgressReporter(agendaJob)
      );
    },
  },
  {
    name: 'create-duty-day-attendances',
    displayName: 'Create Duty Day Attendances',
    defaultSchedule: '5 0 * * *',
    handler: async agendaJob => {
      await createTodayDutyDayAttendances(createProgressReporter(agendaJob));
    },
  },
  {
    name: 'create-duties-attendance-day-records',
    displayName: 'Create Duties and Attendance Day Records',
    defaultSchedule: '10 0 * * *',
    handler: async agendaJob => {
      await createTodayDayRecords(createProgressReporter(agendaJob));
    },
  },
  {
    name: 'publish-dms-lock-expiring-notifications',
    displayName: 'Publish DMS Lock Expiring Notifications',
    // Hourly: warns holders whose long document lock expires within a day.
    // Republishing is a no-op, so reruns are safe.
    defaultSchedule: '0 * * * *',
    handler: async () => {
      await publishExpiringLockNotifications();
    },
  },
  {
    name: 'purge-notifications',
    displayName: 'Purge Notifications',
    // Daily: removes expired notifications and ones older than 90 days.
    defaultSchedule: '15 3 * * *',
    handler: async () => {
      await purgeNotifications();
    },
  },
  {
    name: 'compute-face-vectors',
    displayName: 'Compute Face Vectors',
    // No defaultSchedule - manual-only (Run Now). The initial backlog is tens of thousands of
    // people at ~20ms each, sequential, so this isn't something to run unattended on a cron.
    handler: async agendaJob => {
      await backfillImageVectorData(createProgressReporter(agendaJob));
    },
  },
];

export default JOB_DEFINITIONS_REGISTRY;
