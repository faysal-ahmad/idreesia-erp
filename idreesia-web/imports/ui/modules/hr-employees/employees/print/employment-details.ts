import dayjs from 'dayjs';

import {
  EmploymentStatus,
  EmploymentStatusNames,
  type EmploymentStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { formatShiftTime } from '/imports/ui/modules/helpers/shifts';

/*
 * The employment details the employee print pages show in place of karkun
 * duties: job, shift, status and start date.
 */

interface PrintedShift {
  name?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface PrintedEmployeeData {
  job?: { name?: string | null } | null;
  jobShift?: PrintedShift | null;
  employmentStatus?: string | null;
  employmentStartDate?: string | null;
  probationEndDate?: string | null;
}

const formatDate = (value?: string | null) =>
  value ? dayjs(Number(value)).format('DD MMM YYYY') : '';

export const jobText = (employeeData?: PrintedEmployeeData | null) =>
  employeeData?.job?.name ?? '';

/** "Morning, 8:00 AM – 4:00 PM", or just the name when it has no times. */
export const shiftText = (employeeData?: PrintedEmployeeData | null) => {
  const shift = employeeData?.jobShift;
  if (!shift?.name) return '';
  const times = [formatShiftTime(shift.startTime), formatShiftTime(shift.endTime)]
    .filter(Boolean)
    .join(' – ');
  return [shift.name, times].filter(Boolean).join(', ');
};

/** "Confirmed", or "Probation (until 01 Jan 2027)". */
export const statusText = (employeeData?: PrintedEmployeeData | null) => {
  const status = employeeData?.employmentStatus as EmploymentStatusValue | null | undefined;
  if (!status) return '';
  const name = EmploymentStatusNames[status] ?? status;
  const probationEnd = formatDate(employeeData?.probationEndDate);
  return status === EmploymentStatus.PROBATION && probationEnd
    ? `${name} (until ${probationEnd})`
    : name;
};

export const employmentStartText = (employeeData?: PrintedEmployeeData | null) =>
  formatDate(employeeData?.employmentStartDate);
