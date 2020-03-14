import SimpleSchema from 'simpl-schema';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityTypes,
  OperationTypes,
} from 'meteor/idreesia-common/constants/audit';

import { identifiable } from './';

/*
  const AuditValue = new SimpleSchema({
    fieldName: {
      type: String,
    },
    changedFrom: {
      type: String,
      optional: true,
    },
    changedTo: {
      type: String,
      optional: true,
    },
  });
*/

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
  auditValues: {
    type: Array,
    optional: true,
  },
  'auditValues.$': {
    type: String,
  },
  operationTime: {
    type: Date,
  },
  operationBy: {
    type: String,
  },
}).extend(identifiable);
