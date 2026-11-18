import { useQuery } from '@apollo/client/react';

import {
  DutiesAttendancePermissions,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import type {
  MyDutiesAttendanceLocationsQuery,
  WorkspaceDaDutiesQuery,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MY_DUTIES_ATTENDANCE_LOCATIONS,
  WORKSPACE_DA_ACCESS,
  WORKSPACE_DA_DUTIES,
} from './gql';

export type MyDutiesAttendanceLocation = NonNullable<
  NonNullable<MyDutiesAttendanceLocationsQuery['myDutiesAttendanceLocations']>[number]
>;

export type Duty = NonNullable<
  NonNullable<WorkspaceDaDutiesQuery['workspaceDaDuties']>[number]
>;

// The locations whose workspace the user can open (and their ancestors, for
// the sidebar's location tree).
export const useMyDutiesAttendanceLocations = () => {
  const { data, loading } = useQuery(MY_DUTIES_ATTENDANCE_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const locations = (data?.myDutiesAttendanceLocations ?? []).filter(
    (row): row is MyDutiesAttendanceLocation => row != null
  );
  return { locations, loading: loading && !data };
};

// What the user may do in the location's workspace.
export const useDutiesAttendanceAccess = (locationId: string) => {
  const { data, loading } = useQuery(WORKSPACE_DA_ACCESS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const permissions = (data?.workspaceDaAccess?.permissions ??
    []) as DutiesAttendancePermission[];

  return {
    loading: loading && !data,
    canManageDuties: permissions.includes(
      DutiesAttendancePermissions.MANAGE_AND_PLAN_DUTIES
    ),
    canMarkAttendance: permissions.includes(
      DutiesAttendancePermissions.MARK_ATTENDANCE
    ),
  };
};

export const useDuties = (locationId: string) => {
  const { data, loading, refetch } = useQuery(WORKSPACE_DA_DUTIES, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const duties = (data?.workspaceDaDuties ?? []).filter(
    (duty): duty is Duty => duty != null
  );
  return { duties, loading: loading && !data, refetch };
};
