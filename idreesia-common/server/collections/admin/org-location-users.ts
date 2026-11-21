import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { OrgLocationUser as OrgLocationUserSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface OrgLocationUserDocument {
  _id?: string;
  locationId: string;
  userId: string;
  /** Stored as `<group>.<permission>`, e.g. `duties-attendance.view`. */
  permissions: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

/** The single store of who may do what on a location. */
class OrgLocationUsers extends AggregatableCollection<OrgLocationUserDocument> {
  constructor(name = 'org-location-users', options = {}) {
    super(name, options);
    this.attachSchema(OrgLocationUserSchema);
  }
}

export default new OrgLocationUsers();
