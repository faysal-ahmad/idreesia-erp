import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { RequestStatus } from 'meteor/idreesia-common/constants/imdad';
import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  requestDate: {
    type: Date,
  },
  status: {
    type: String,
    allowedValues: values(RequestStatus),
  },
})
  .extend(identifiable)
  .extend(timestamps);
