import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PeopleTag as PeopleTagSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface PeopleTagDocument {
  _id?: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class PeopleTags extends AggregatableCollection<PeopleTagDocument> {
  constructor(name = 'people-tags', options = {}) {
    super(name, options);
    this.attachSchema(PeopleTagSchema);
  }
}

export default new PeopleTags();
