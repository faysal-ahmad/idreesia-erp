import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Notification as Schema } from 'meteor/idreesia-common/server/schemas/common';

export interface NotificationDocument {
  _id: string;
  module: string;
  /** The committee the notification is for. */
  committeeId: string;
  entityType: string;
  entityId: string;
  eventType: string;
  eventDetails: string;
  recipientUserId?: string;
  actorUserId?: string;
  data?: Record<string, unknown>;
  expiresAt?: Date;
  readBy: string[];
  contentHash: string;
  createdAt: Date;
  updatedAt: Date;
}

class Notifications extends AggregatableCollection<NotificationDocument> {
  constructor(name = 'common-notifications', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new Notifications();
