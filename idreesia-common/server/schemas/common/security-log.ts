import SimpleSchema from 'simpl-schema';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { DataSource } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';

import { identifiable } from './';

export default new SimpleSchema({
  userId: {
    type: String,
    optional: true,
  },
  groupId: {
    type: String,
    optional: true,
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
  dataSource: {
    type: String,
    allowedValues: values(DataSource),
  },
  // Use for saving portalId when the dataSource is portal
  dataSourceDetail: {
    type: String,
    optional: true,
  },
}).extend(identifiable);
