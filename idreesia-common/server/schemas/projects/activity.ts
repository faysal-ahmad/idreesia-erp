import SimpleSchema from 'simpl-schema';

import {
  ProjectsAction,
  ProjectsEntityType,
} from 'meteor/idreesia-common/constants/projects';

import { identifiable } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for workspace-level entries and standalone-task entries.
  projectId: {
    type: String,
    optional: true,
  },
  entityType: {
    type: String,
    allowedValues: Object.values(ProjectsEntityType),
  },
  taskId: {
    type: String,
    optional: true,
  },
  entityId: {
    type: String,
  },
  action: {
    type: String,
    allowedValues: Object.values(ProjectsAction),
  },
  userId: {
    type: String,
  },
  at: {
    type: Date,
  },
  // Never holds comment text.
  details: {
    type: Object,
    optional: true,
    blackbox: true,
  },
}).extend(identifiable);
