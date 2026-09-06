import type { Job } from 'agenda';
import { addMonths, format, startOfMonth } from 'date-fns';

import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-attendance';
import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';
import { backfillImageVectorData } from 'meteor/idreesia-common/server/business-logic/common/backfill-image-vector-data';
import { backfillImageThumbnails } from 'meteor/idreesia-common/server/business-logic/common/backfill-image-thumbnails';
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
    name: 'create-monthly-attendance',
    displayName: 'Create Monthly Attendance',
    defaultSchedule: '0 2 1 * *',
    handler: async agendaJob => {
      const systemUser = await getSystemUser();
      const formattedMonth = format(startOfMonth(new Date()), 'MM-yyyy');
      await createMonthlyAttendance(
        formattedMonth,
        systemUser,
        createProgressReporter(agendaJob)
      );
    },
  },
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
    name: 'compute-face-vectors',
    displayName: 'Compute Face Vectors',
    // No defaultSchedule - manual-only (Run Now). The initial backlog is tens of thousands of
    // people at ~20ms each, sequential, so this isn't something to run unattended on a cron.
    handler: async agendaJob => {
      await backfillImageVectorData(createProgressReporter(agendaJob));
    },
  },
  {
    name: 'create-image-thumbnails',
    displayName: 'Create Image Thumbnails',
    // No defaultSchedule - manual-only (Run Now). This is a one-time backlog for people who
    // already have an image but no thumbnail; new images get a thumbnail automatically as soon
    // as they're set (see People.updatePerson).
    handler: async agendaJob => {
      await backfillImageThumbnails(createProgressReporter(agendaJob));
    },
  },
];

export default JOB_DEFINITIONS_REGISTRY;
