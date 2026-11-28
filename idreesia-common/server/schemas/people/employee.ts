import SimpleSchema from 'simpl-schema';

import {
  EMPLOYMENT_STATUSES,
  WORKING_DAYS,
} from 'meteor/idreesia-common/constants/hr/employment';

export default new SimpleSchema({
  jobId: {
    type: String,
    optional: true,
  },
  // One of the job's shifts (hr-job-shifts); none when the job has no shifts.
  jobShiftId: {
    type: String,
    optional: true,
  },
  // The days this employee works. Missing means every day.
  workingDays: {
    type: Array,
    optional: true,
  },
  'workingDays.$': {
    type: String,
    allowedValues: [...WORKING_DAYS],
  },
  // The Multan karkun HR checks with (e.g. before approving leave).
  // Informational only: it grants that person nothing.
  reportsToPersonId: {
    type: String,
    optional: true,
  },
  employmentStatus: {
    type: String,
    allowedValues: [...EMPLOYMENT_STATUSES],
    optional: true,
  },
  // Start of the current employment period; earlier periods are in
  // hr-employment-events.
  employmentStartDate: {
    type: Date,
    optional: true,
  },
  employmentEndDate: {
    type: Date,
    optional: true,
  },
  probationEndDate: {
    type: Date,
    optional: true,
  },
  confirmationDate: {
    type: Date,
    optional: true,
  },
  bankAccountDetails: {
    type: String,
    optional: true,
  },
});
