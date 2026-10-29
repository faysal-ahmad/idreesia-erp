import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityServerAlert as SecurityServerAlertSchema } from 'meteor/idreesia-common/server/schemas/security';

export interface SecurityServerAlertDocument {
  _id: string;
  externalId: string;
  profileId: string;
  profileName: string;
  profileIsTest: boolean;
  channelId: string;
  channelName: string;
  timestamp: Date;
  similarityScore: number;
  faceSizePx?: number;
  faceQualityScore?: number;
  faceQualityReasons?: string[];
  imageKey: string;
  thumbnailKey?: string;
  review?: 'CORRECT' | 'FALSE_POSITIVE';
  reviewedAt?: Date;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

class SecurityServerAlerts extends AggregatableCollection<SecurityServerAlertDocument> {
  constructor(name = 'security-server-alerts', options = {}) {
    super(name, options);
    this.attachSchema(SecurityServerAlertSchema);
  }
}

export default new SecurityServerAlerts();
