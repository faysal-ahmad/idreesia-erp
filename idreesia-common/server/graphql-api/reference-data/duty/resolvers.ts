import {
  Duties,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';

export default {
  Query: {
    referenceMsDuties: async () =>
      Duties.find(
        { isMehfilDuty: { $eq: false } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    referenceDutyShifts: async () =>
      DutyShifts.find({}, { sort: { dutyId: 1 } }).fetchAsync(),
  },
};
