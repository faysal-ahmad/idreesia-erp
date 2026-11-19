import { GraphQLError } from 'graphql';

import {
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { DutiesAttendanceWorkspaceUsers } from 'meteor/idreesia-common/server/collections/duties-attendance';
import { getLocationDutiesAttendanceWorkspaceId } from 'meteor/idreesia-common/server/business-logic/admin/org-location-features';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface DutiesAttendanceUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

/** What `@checkDutiesAttendanceAccess` found out about the caller. */
export interface DutiesAttendanceAccess {
  locationId: string;
  /** The location's Duties and Attendance workspace. */
  workspaceId: string;
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
 * The caller's access to a location's Duties and Attendance workspace: the
 * permissions set on their workspace user entry, or every permission for a
 * super-admin. Throws FORBIDDEN when they are not a user of the workspace,
 * and NOT_FOUND to a super-admin when the feature is off.
 */
export const loadDutiesAttendanceAccess = async (
  user: DutiesAttendanceUser | null | undefined,
  locationId: string
): Promise<DutiesAttendanceAccess> => {
  if (!user?._id || user.locked) {
    throw forbidden('You do not have access to this workspace.');
  }

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  const superAdmin = isSuperAdmin(user);
  if (!location || (!superAdmin && !location.dutiesAttendanceWorkspaceId)) {
    throw forbidden('You do not have access to this workspace.');
  }

  // Throws NOT_FOUND when the feature is off.
  let workspaceId: string;
  try {
    workspaceId = getLocationDutiesAttendanceWorkspaceId(location);
  } catch (error) {
    if (superAdmin) throw error;
    throw forbidden('You do not have access to this workspace.');
  }

  if (superAdmin) {
    return {
      locationId,
      workspaceId,
      userId: user._id,
      permissions: DutiesAttendancePermissionValues,
    };
  }

  const entry = await DutiesAttendanceWorkspaceUsers.findOneAsync({
    workspaceId,
    userId: user._id,
  });
  if (!entry) throw forbidden('You do not have access to this workspace.');
  return {
    locationId,
    workspaceId,
    userId: user._id,
    permissions: entry.permissions,
  };
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
