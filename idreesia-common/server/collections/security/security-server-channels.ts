import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityServerChannel as SecurityServerChannelSchema } from 'meteor/idreesia-common/server/schemas/security';

export interface SecurityServerChannelConnectionDocument {
  host: string;
  port?: number;
  path?: string;
  username?: string;
  password?: string;
}

export interface SecurityServerChannelDocument {
  _id: string;
  externalId?: string;
  name: string;
  enabled: boolean;
  similarityThreshold?: number;
  recognitionFps: number;
  connection: SecurityServerChannelConnectionDocument;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

class SecurityServerChannels extends AggregatableCollection<SecurityServerChannelDocument> {
  constructor(name = 'security-server-channels', options = {}) {
    super(name, options);
    this.attachSchema(SecurityServerChannelSchema);
  }
}

export default new SecurityServerChannels();
