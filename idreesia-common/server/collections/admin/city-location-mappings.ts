import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { CityLocationMapping as CityLocationMappingSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface CityLocationMappingDocument {
  _id?: string;
  city: string;
  locationId: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class CityLocationMappings extends AggregatableCollection<CityLocationMappingDocument> {
  constructor(name = 'city-location-mappings', options = {}) {
    super(name, options);
    this.attachSchema(CityLocationMappingSchema);
  }
}

export default new CityLocationMappings();
