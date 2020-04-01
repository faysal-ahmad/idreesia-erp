import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { DataSource } from 'meteor/idreesia-common/constants';
import { RequestStatus } from 'meteor/idreesia-common/constants/imdad';
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
    allowedValues: values(RequestStatus),
  },
})
  .extend(identifiable)
  .extend(timestamps);
