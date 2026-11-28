// Employment lifecycle and leave values, shared by the server and the UI.

export const WORKING_DAYS = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;
export type WorkingDay = (typeof WORKING_DAYS)[number];

export const EmploymentStatus = {
  PROBATION: 'probation',
  CONFIRMED: 'confirmed',
  EXITED: 'exited',
} as const;
export type EmploymentStatusValue =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];
export const EMPLOYMENT_STATUSES = Object.values(EmploymentStatus);

export const EmploymentStatusNames: Record<EmploymentStatusValue, string> = {
  probation: 'Probation',
  confirmed: 'Confirmed',
  exited: 'Exited',
};

export const EmploymentEventType = {
  JOINED: 'joined',
  CONFIRMED: 'confirmed',
  JOB_CHANGED: 'job-changed',
  EXITED: 'exited',
  REJOINED: 'rejoined',
} as const;
export type EmploymentEventTypeValue =
  (typeof EmploymentEventType)[keyof typeof EmploymentEventType];
export const EMPLOYMENT_EVENT_TYPES = Object.values(EmploymentEventType);

export const EmploymentEventTypeNames: Record<EmploymentEventTypeValue, string> =
  {
    joined: 'Joined',
    confirmed: 'Confirmed',
    'job-changed': 'Job changed',
    exited: 'Exited',
    rejoined: 'Rejoined',
  };

export const ExitReason = {
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
  RETIRED: 'retired',
  DECEASED: 'deceased',
  OTHER: 'other',
} as const;
export type ExitReasonValue = (typeof ExitReason)[keyof typeof ExitReason];
export const EXIT_REASONS = Object.values(ExitReason);

export const ExitReasonNames: Record<ExitReasonValue, string> = {
  resigned: 'Resigned',
  terminated: 'Terminated',
  retired: 'Retired',
  deceased: 'Deceased',
  other: 'Other',
};

export const LeaveRequestStatus = {
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;
export type LeaveRequestStatusValue =
  (typeof LeaveRequestStatus)[keyof typeof LeaveRequestStatus];
export const LEAVE_REQUEST_STATUSES = Object.values(LeaveRequestStatus);

export const LeaveRequestStatusNames: Record<LeaveRequestStatusValue, string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
