import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/accounts';
import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  requestDate: {
    type: Date,
  },
  dataSource: {
    type: String,
    allowedValues: values(DataSource),
  },
  status: {
    type: String,
    allowedValues: values(ImdadRequestStatus),
  },
  notes: {
    type: String,
    optional: true,
  },
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
