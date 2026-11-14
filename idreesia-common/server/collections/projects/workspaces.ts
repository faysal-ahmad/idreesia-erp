import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ProjectsWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/projects';

import type { ProjectsWorkspaceDocument } from './types';

class ProjectsWorkspaces extends AggregatableCollection<ProjectsWorkspaceDocument> {
  constructor(name = 'projects-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new ProjectsWorkspaces();
