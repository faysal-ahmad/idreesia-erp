import SimpleSchema from 'simpl-schema';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';

import { identifiable } from './';

export default new SimpleSchema({
  userId: {
    type: String,
  },
  operationType: {
    type: String,
    allowedValues: values(SecurityOperationType),
  },
  operationDetails: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  operationTime: {
    type: Date,
  },
  operationBy: {
    type: String,
    optional: true,
  },
}).extend(identifiable);
