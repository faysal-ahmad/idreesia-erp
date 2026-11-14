import SimpleSchema from 'simpl-schema';

import {
  TaskPriority,
  TaskStatus,
} from 'meteor/idreesia-common/constants/projects';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for a standalone task.
  projectId: {
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
  // One assignee only. Opaque id chosen by the caller (e.g. a karkun id).
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
    allowedValues: Object.values(TaskStatus),
  },
  priority: {
    type: String,
    allowedValues: Object.values(TaskPriority),
  },
  // 0-100.
  progress: {
    type: SimpleSchema.Integer,
  },
  tags: {
    type: Array,
  },
  'tags.$': {
    type: String,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  completedAt: {
    type: Date,
    optional: true,
  },
  completedBy: {
    type: String,
    optional: true,
  },
  commentCount: {
    type: SimpleSchema.Integer,
  },
  revision: {
    type: SimpleSchema.Integer,
  },
})
  .extend(identifiable)
  .extend(timestamps);
