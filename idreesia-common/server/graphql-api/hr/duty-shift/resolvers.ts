import {
  Duties,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';
import { shiftIsPlanned } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyShiftType: {
    duty: async dutyShiftType => Duties.findOneAsync(dutyShiftType.dutyId),
    canDelete: async dutyShiftType => !(await shiftIsPlanned(dutyShiftType._id)),
  },

  Query: {
    allDutyShifts: async () =>
      DutyShifts.find({}, { sort: { dutyId: 1 } }).fetchAsync(),

    dutyShiftById: async (obj, { id }) => DutyShifts.findOneAsync(id),
  },

  Mutation: {
    createDutyShift: async (
      obj,
      { name, dutyId, startTime, endTime },
      { user }
    ) => {
      const date = new Date();
      const dutyShiftId = await DutyShifts.insertAsync({
        name,
        dutyId,
        startTime,
        endTime,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyShifts.findOneAsync(dutyShiftId);
    },

    updateDutyShift: async (
      obj,
      { _id, name, dutyId, startTime, endTime },
      { user }
    ) => {
      const date = new Date();
      await DutyShifts.updateAsync(_id, {
        $set: {
          name,
          dutyId,
          startTime,
          endTime,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return DutyShifts.findOneAsync(_id);
    },

    removeDutyShift: async (obj, { _id }) => {
      if (await shiftIsPlanned(_id)) {
        throw new Error(
          'This shift cannot be deleted as it is currently in use.'
        );
      }

      return DutyShifts.removeAsync(_id);
    },
  },
};

export default resolvers;
