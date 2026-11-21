import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MehfilTemplateDuty as Schema } from 'meteor/idreesia-common/server/schemas/admin';

export interface MehfilTemplateDutyDocument {
  _id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class MehfilTemplateDuties extends AggregatableCollection<MehfilTemplateDutyDocument> {
  constructor(name = 'mehfil-template-duties', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new MehfilTemplateDuties();
