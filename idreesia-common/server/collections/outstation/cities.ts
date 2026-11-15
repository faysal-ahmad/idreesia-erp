import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/outstation';

export interface CityDocument {
  _id?: string;
  name?: string;
  country?: string;
  peripheryOf?: string;
  region?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  [key: string]: unknown;
}

class Cities extends AggregatableCollection<CityDocument> {
  constructor(name = 'outstation-cities', options = {}) {
    super(name, options);
    this.attachSchema(CitySchema);
  }
}

export default new Cities();
