import { GraphQLError } from 'graphql';

import {
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import { OrgLocationFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import {
  getOrgLocationUserPermissions,
  hasOrgLocationFeatures,
} from 'meteor/idreesia-common/server/business-logic/admin/org-location-features';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface DutiesAttendanceUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  personId?: string | null;
}

/** What `@checkDutiesAttendanceAccess` found out about the caller. */
export interface DutiesAttendanceAccess {
  locationId: string;
  userId: string;
  permissions: DutiesAttendancePermission[];
}

export interface DutiesAttendanceAccessContext {
  user?: DutiesAttendanceUser | null;
  /** Filled by `@checkDutiesAttendanceAccess`, keyed by location id. */
  dutiesAttendanceAccess?: Record<string, DutiesAttendanceAccess>;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

/**
 * The caller's access to a location's Duties and Attendance: the permissions
 * set for them on the location, or every permission for a super-admin. Throws
 * FORBIDDEN when they have none, or when the location is not a mehfil.
 */
export const loadDutiesAttendanceAccess = async (
  user: DutiesAttendanceUser | null | undefined,
  locationId: string
): Promise<DutiesAttendanceAccess> => {
  if (!user?._id || user.locked) {
    throw forbidden('You do not have access to this location.');
  }

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !hasOrgLocationFeatures(location)) {
    throw forbidden('You do not have access to this location.');
  }
  const superAdmin = isSuperAdmin(user);

  if (superAdmin) {
    return {
      locationId,
      userId: user._id,
      permissions: DutiesAttendancePermissionValues,
    };
  }

  const stored = await getOrgLocationUserPermissions(
    user._id,
    locationId,
    OrgLocationFeatureKeys.DUTIES_ATTENDANCE
  );
  // In the canonical order, whatever order they were stored in.
  const permissions = DutiesAttendancePermissionValues.filter(permission =>
    stored.includes(permission)
  );
  if (permissions.length === 0) {
    throw forbidden('You do not have access to this location.');
  }
  return { locationId, userId: user._id, permissions };
};

/**
 * The access `@checkDutiesAttendanceAccess` recorded for the location. A
 * field that needs it must carry the directive, so a missing entry is a
 * schema mistake.
 */
export const getDutiesAttendanceAccess = (
  context: DutiesAttendanceAccessContext,
  locationId: string
): DutiesAttendanceAccess => {
  const access = context.dutiesAttendanceAccess?.[locationId];
  if (!access) {
    throw new Error(
      'Duties and Attendance access was not checked. Add @checkDutiesAttendanceAccess to the field.'
    );
  }
  return access;
};
