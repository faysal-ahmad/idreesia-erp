import { isBefore, startOfMonth } from 'date-fns';

import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

/**
 * @checkPermissions on the schema already requires HR_MANAGE_EMPLOYEES or
 * HR_DELETE_DATA to remove salaries; past months additionally require
 * HR_DELETE_DATA specifically, which the directive can't express.
 */
export function assertCanRemoveSalariesOfMonth(
  user: Parameters<typeof hasOnePermission>[0],
  month: string,
  now: Date = new Date()
) {
  const passedMonth = parseDate(month, Formats.DATE_FORMAT);
  if (
    isBefore(passedMonth, startOfMonth(now)) &&
    !hasOnePermission(user, [PermissionConstants.HR_DELETE_DATA])
  ) {
    throw new Error(
      'You do not have permission to remove salaries for past months in the System.'
    );
  }
}
