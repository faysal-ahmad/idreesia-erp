import dayjs from 'dayjs';

import type { LeaveRequestStatusValue } from 'meteor/idreesia-common/constants/hr/employment';

export const LEAVE_STATUS_COLORS: Record<LeaveRequestStatusValue, string> = {
  submitted: 'gold',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

/** "12 Mar 2026", "12–14 Mar 2026" or "12 Mar 2026 (half day)". */
export const formatLeaveDates = (request: {
  fromDate?: string | null;
  toDate?: string | null;
  halfDay?: boolean | null;
}) => {
  if (!request.fromDate) return '';
  const from = dayjs(request.fromDate);
  const to = dayjs(request.toDate ?? request.fromDate);
  if (request.fromDate === request.toDate || !request.toDate) {
    return `${from.format('DD MMM YYYY')}${request.halfDay ? ' (half day)' : ''}`;
  }
  return `${from.format('DD MMM YYYY')} – ${to.format('DD MMM YYYY')}`;
};
