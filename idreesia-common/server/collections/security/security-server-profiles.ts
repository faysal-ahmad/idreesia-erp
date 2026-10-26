import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityServerProfile as SecurityServerProfileSchema } from 'meteor/idreesia-common/server/schemas/security';

export interface SecurityServerProfileImageDocument {
  _id: string;
  externalId?: string;
  imageKey: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface SecurityServerProfileDocument {
  _id: string;
  externalId?: string;
  name: string;
  isTest: boolean;
  images: SecurityServerProfileImageDocument[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

class SecurityServerProfiles extends AggregatableCollection<SecurityServerProfileDocument> {
  constructor(name = 'security-server-profiles', options = {}) {
    super(name, options);
    this.attachSchema(SecurityServerProfileSchema);
  }
}

export default new SecurityServerProfiles();
