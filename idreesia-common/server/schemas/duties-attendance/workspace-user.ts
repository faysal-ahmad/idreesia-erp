import SimpleSchema from 'simpl-schema';

import { DutiesAttendancePermissionValues } from 'meteor/idreesia-common/constants/duties-attendance';
import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  userId: {
    type: String,
  },
  permissions: {
    type: Array,
  },
  'permissions.$': {
    type: String,
    allowedValues: DutiesAttendancePermissionValues,
  },
})
  .extend(identifiable)
  .extend(timestamps);
