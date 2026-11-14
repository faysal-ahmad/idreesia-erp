import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Project as Schema } from 'meteor/idreesia-common/server/schemas/projects';

import type { ProjectDocument } from './types';

class Projects extends AggregatableCollection<ProjectDocument> {
  constructor(name = 'projects', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new Projects();
