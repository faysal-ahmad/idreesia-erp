import SimpleSchema from 'simpl-schema';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityTypes,
  OperationTypes,
} from 'meteor/idreesia-common/constants/audit';

import { identifiable } from './';

export default new SimpleSchema({
  entityId: {
    type: String,
  },
  entityType: {
    type: String,
    allowedValues: values(EntityTypes),
  },
  operationType: {
    type: String,
    allowedValues: values(OperationTypes),
  },
  operationTime: {
    type: Date,
  },
  operationBy: {
    type: String,
  },
}).extend(identifiable);
