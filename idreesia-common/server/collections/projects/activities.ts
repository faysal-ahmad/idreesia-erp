import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ProjectsActivity as Schema } from 'meteor/idreesia-common/server/schemas/projects';

import type { ProjectsActivityDocument } from './types';

class ProjectsActivities extends AggregatableCollection<ProjectsActivityDocument> {
  constructor(name = 'projects-activities', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new ProjectsActivities();
