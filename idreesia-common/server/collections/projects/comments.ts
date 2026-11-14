import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ProjectComment as Schema } from 'meteor/idreesia-common/server/schemas/projects';

import type { ProjectCommentDocument } from './types';

class ProjectComments extends AggregatableCollection<ProjectCommentDocument> {
  constructor(name = 'project-comments', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new ProjectComments();
