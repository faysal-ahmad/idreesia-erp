import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Person as PersonSchema } from 'meteor/idreesia-common/server/schemas/people';

type LooseRecord = Record<string, any>;

export interface PersonDocument extends LooseRecord {
  _id: string;
  dataSource?: string;
  isVisitor?: boolean;
  isKarkun?: boolean;
  isEmployee?: boolean;
  userId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  sharedData: LooseRecord;
  visitorData?: LooseRecord | null;
  karkunData?: LooseRecord | null;
  employeeData?: LooseRecord | null;
}

export type PersonInput = LooseRecord & {
  _id?: string;
  dataSource?: string;
  sharedData?: LooseRecord;
  visitorData?: LooseRecord;
  karkunData?: LooseRecord;
  employeeData?: LooseRecord;
};

class People extends AggregatableCollection<PersonDocument> {
  constructor(name = 'common-people', options = {}) {
    super(name, options);
    this.attachSchema(PersonSchema);
  }
}

export default new People();
