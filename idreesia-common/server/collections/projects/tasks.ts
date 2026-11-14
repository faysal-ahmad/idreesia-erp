import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ProjectTask as Schema } from 'meteor/idreesia-common/server/schemas/projects';

import type { ProjectTaskDocument } from './types';

class ProjectTasks extends AggregatableCollection<ProjectTaskDocument> {
  constructor(name = 'project-tasks', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new ProjectTasks();
