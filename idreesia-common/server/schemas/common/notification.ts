import SimpleSchema from 'simpl-schema';

import identifiable from './identifiable';

// `_id` is `<module>:<module's own notification id>`, so a module producing
// the same id twice updates one document.
export default new SimpleSchema({
  module: { type: String },
  // The committee the notification is for. A module addresses a workspace;
  // the ERP finds the committee that owns it and stores only that.
  committeeId: { type: String },
  entityType: { type: String },
  entityId: { type: String },
  eventType: { type: String },
  eventDetails: { type: String },
  // Absent: for everyone in the committee.
  recipientUserId: { type: String, optional: true },
  actorUserId: { type: String, optional: true },
  data: { type: Object, optional: true, blackbox: true },
  expiresAt: { type: Date, optional: true },
  // People who have read it.
  readBy: { type: Array },
  'readBy.$': { type: String },
  // Hash of the content the module last supplied; unchanged content is not
  // rewritten (which would reset readBy).
  contentHash: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}).extend(identifiable);
