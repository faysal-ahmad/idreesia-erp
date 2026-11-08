import SimpleSchema from 'simpl-schema';

import { MeetingActionItemStatus } from 'meteor/idreesia-common/constants/meetings';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  meetingId: {
    type: String,
  },
  // The agenda item of the meeting this came out of, if any.
  agendaItemId: {
    type: String,
    optional: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  // Opaque id chosen by the caller (e.g. a karkun id).
  assigneeId: {
    type: String,
    optional: true,
  },
  dueDate: {
    type: Date,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: Object.values(MeetingActionItemStatus),
  },
  completedAt: {
    type: Date,
    optional: true,
  },
  completedBy: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
