import SimpleSchema from 'simpl-schema';

import { ProjectStatus } from 'meteor/idreesia-common/constants/projects';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  title: {
    type: String,
  },
  objective: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: Object.values(ProjectStatus),
  },
  // The people working on the project.
  participantIds: {
    type: Array,
  },
  'participantIds.$': {
    type: String,
  },
  startDate: {
    type: Date,
    optional: true,
  },
  targetDate: {
    type: Date,
    optional: true,
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
  // Opaque id of the project's chat group; set by the consuming feature.
  chatGroupId: {
    type: String,
    optional: true,
  },
  // Derived from the project's tasks (cancelled tasks excluded).
  taskCount: {
    type: SimpleSchema.Integer,
  },
  doneCount: {
    type: SimpleSchema.Integer,
  },
  progress: {
    type: SimpleSchema.Integer,
  },
  completedAt: {
    type: Date,
    optional: true,
  },
  completedBy: {
    type: String,
    optional: true,
  },
  revision: {
    type: SimpleSchema.Integer,
  },
})
  .extend(identifiable)
  .extend(timestamps);
