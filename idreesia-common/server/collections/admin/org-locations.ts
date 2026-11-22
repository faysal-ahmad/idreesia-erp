import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { OrgLocation as OrgLocationSchema } from 'meteor/idreesia-common/server/schemas/admin';
import type { OrgLocationType } from 'meteor/idreesia-common/constants/organization';

export interface OrgLocationMehfilDetails {
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
  latitude?: number;
  longitude?: number;
  /**
   * Attendance must be marked within this many metres of the location (50,
   * 100 or 200). Missing: no geofence. Only with a location set.
   */
  attendanceGeofenceMeters?: number;
}

export interface OrgLocationDocument {
  _id?: string;
  name: string;
  type: OrgLocationType;
  parentId?: string | null;
  allParentIds?: string[];
  mehfilDetails?: OrgLocationMehfilDetails;
  observerKarkunIds?: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class OrgLocations extends AggregatableCollection<OrgLocationDocument> {
  constructor(name = 'org-locations', options = {}) {
    super(name, options);
    this.attachSchema(OrgLocationSchema);
  }
}

export default new OrgLocations();
