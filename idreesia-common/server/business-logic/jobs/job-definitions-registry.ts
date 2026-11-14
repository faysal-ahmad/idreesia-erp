import type { Job } from 'agenda';
import { addMonths, format, startOfMonth } from 'date-fns';

import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';
import { backfillImageVectorData } from 'meteor/idreesia-common/server/business-logic/common/backfill-image-vector-data';
import { backfillImageThumbnails } from 'meteor/idreesia-common/server/business-logic/common/backfill-image-thumbnails';
import { moveImagesToStorage } from 'meteor/idreesia-common/server/business-logic/common/move-images-to-storage';
import { removeMigratedImagesFromDb } from 'meteor/idreesia-common/server/business-logic/common/remove-migrated-images-from-db';
import { publishExpiringLockNotifications } from 'meteor/idreesia-common/server/business-logic/dms';
import { purgeNotifications } from 'meteor/idreesia-common/server/headless';
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
  {
    name: 'move-images-to-storage',
    displayName: 'Move Images to Storage',
    // No defaultSchedule - manual-only (Run Now). A one-time copy of existing
    // files from Attachments into object storage - people's profile photos,
    // stock item images, and purchase form / issuance form / karkun
    // attachments; new uploads go there directly. Copy only - see
    // remove-migrated-images-from-db.
    handler: async agendaJob => {
      await moveImagesToStorage(createProgressReporter(agendaJob));
    },
  },
  {
    name: 'remove-migrated-images-from-db',
    displayName: 'Remove Migrated Images from DB',
    // No defaultSchedule - manual-only (Run Now), once the copied files have
    // been checked. Removes from Mongo the content of files confirmed to
    // exist in object storage.
    handler: async agendaJob => {
      await removeMigratedImagesFromDb(createProgressReporter(agendaJob));
    },
  },
];

export default JOB_DEFINITIONS_REGISTRY;
