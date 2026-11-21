import { useQuery } from '@apollo/client/react';

import {
  DutiesAttendancePermissions,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import type { MobileDaDutiesQuery } from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_DA_ACCESS, MOBILE_DA_DUTIES } from './gql';

export type Duty = NonNullable<NonNullable<MobileDaDutiesQuery['workspaceDaDuties']>[number]>;
export type DutyMember = NonNullable<NonNullable<Duty['members']>[number]>;

/** The location's duties, with their rosters. Read offline from the saved cache. */
export const useDuties = (locationId: string) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_DA_DUTIES, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const duties = (data?.workspaceDaDuties ?? []).filter((duty): duty is Duty => duty != null);
  return {
    duties,
    loading: loading && !data,
    // Offline, a cached list comes back with a network error: not a failure.
    error: data ? undefined : error,
    refetch,
  };
};

/** What the user may do in the location's workspace. */
export const useDaAccess = (locationId: string) => {
  const { data } = useQuery(MOBILE_DA_ACCESS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const permissions = (data?.workspaceDaAccess?.permissions ?? []) as DutiesAttendancePermission[];
  return {
    canManageDuties: permissions.includes(DutiesAttendancePermissions.MANAGE_AND_PLAN_DUTIES),
    canMarkAttendance: permissions.includes(DutiesAttendancePermissions.MARK_ATTENDANCE),
  };
};
