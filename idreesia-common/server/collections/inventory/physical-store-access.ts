import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PhysicalStoreAccess as PhysicalStoreAccessSchema } from 'meteor/idreesia-common/server/schemas/inventory';

export interface PhysicalStoreAccessDocument {
  _id?: string;
  physicalStoreId: string;
  subjectType: 'user' | 'group';
  subjectId: string;
  /** The `stores-*` permission values the subject holds on the store. */
  permissions: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

/** The single store of who may do what on a physical store. */
class PhysicalStoreAccess extends AggregatableCollection<PhysicalStoreAccessDocument> {
  constructor(name = 'inventory-physical-store-access', options = {}) {
    super(name, options);
    this.attachSchema(PhysicalStoreAccessSchema);
  }
}

export default new PhysicalStoreAccess();
