import { addMonths, format, startOfMonth } from 'date-fns';

import { createMonthlyAttendance } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-attendance';
import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';
import { getSystemUser } from './system-user';

export interface JobDefinitionSeed {
  name: string;
  displayName: string;
  // Omit for a manual-only job - one that only ever runs via Run Now and is
  // never registered as a recurring job.
  defaultSchedule?: string;
  handler: () => Promise<void>;
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
    handler: async () => {
      const systemUser = await getSystemUser();
      const formattedMonth = format(startOfMonth(new Date()), 'MM-yyyy');
      await createMonthlyAttendance(formattedMonth, systemUser);
    },
  },
  {
    name: 'create-monthly-salaries',
    displayName: 'Create Monthly Salaries',
    defaultSchedule: '0 2 1 * *',
    handler: async () => {
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
        systemUser
      );
    },
  },
];

export default JOB_DEFINITIONS_REGISTRY;
