import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { JobDefinition as JobDefinitionSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface JobDefinitionDocument {
  _id?: string;
  name: string;
  displayName: string;
  // Absent entirely for a manual-only job definition - one that can only be
  // triggered via Run Now, never recurring. See recurring-schedule.ts.
  defaultSchedule?: string;
  schedule?: string;
  enabled: boolean;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class JobDefinitions extends AggregatableCollection<JobDefinitionDocument> {
  constructor(name = 'job-definitions', options = {}) {
    super(name, options);
    this.attachSchema(JobDefinitionSchema);
  }
}

export default new JobDefinitions();
