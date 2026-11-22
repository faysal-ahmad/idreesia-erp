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
  /** Attendance is checked against the location. Only with a location set. */
  attendanceGeofencing?: boolean;
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
