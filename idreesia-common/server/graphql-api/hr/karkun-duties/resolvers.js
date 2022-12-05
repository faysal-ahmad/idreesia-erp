import {
  KarkunDuties,
  Duties,
  DutyShifts,
  DutyLocations,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  KarkunDutyType: {
    duty: async karkunDutyType => Duties.findOne(karkunDutyType.dutyId),
    shift: async karkunDutyType => {
      if (!karkunDutyType.shiftId) return null;
      return DutyShifts.findOne(karkunDutyType.shiftId);
    },
    location: async karkunDutyType => {
      if (!karkunDutyType.locationId) return null;
      return DutyLocations.findOne(karkunDutyType.locationId);
    },

    dutyName: async karkunDutyType => {
      const duty = Duties.findOne(karkunDutyType.dutyId);
      return duty ? duty.name : null;
    },
    shiftName: async karkunDutyType => {
      if (!karkunDutyType.shiftId) return null;
      const shift = DutyShifts.findOne(karkunDutyType.shiftId);
      return shift ? shift.name : null;
    },
    locationName: async karkunDutyType => {
      if (!karkunDutyType.locationId) return null;
      const location = DutyLocations.findOne(karkunDutyType.locationId);
      return location ? location.name : null;
    },
  },

  Query: {
    karkunDutiesByKarkunId: async (obj, { karkunId }) =>
      KarkunDuties.find({
        karkunId: { $eq: karkunId },
      }).fetch(),
    karkunDutyById: async (obj, { _id }) => KarkunDuties.findOne(_id),
  },

  Mutation: {
    createKarkunDuty: async (
      obj,
      { karkunId, dutyId, role, shiftId, locationId, daysOfWeek },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          'You do not have permission to manage Karkun Duties in the System.'
        );
      }

      /*
        const existingKarkunDuty = KarkunDuties.findOne({
          karkunId: { $eq: karkunId },
          dutyId: { $eq: dutyId }
        });
        if (existingKarkunDuty) {
          throw Error('This duty is already assigned to the karkun.');
        }
      */

      const newDuty = {
        karkunId,
        dutyId,
        shiftId,
        locationId,
        role,
        daysOfWeek,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    updateKarkunDuty: async (
      obj,
      { _id, karkunId, dutyId, shiftId, locationId, role, daysOfWeek },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          'You do not have permission to manage Karkun Duties in the System.'
        );
      }
      /*
        const existingKarkunDuty = KarkunDuties.findOne({
          karkunId: { $eq: karkunId },
          dutyId: { $eq: dutyId }
        });
        if (existingKarkunDuty && existingKarkunDuty._id !== _id) {
          throw Error('This duty is already assigned to the karkun.');
        }
      */

      KarkunDuties.update(_id, {
        $set: {
          karkunId,
          dutyId,
          shiftId,
          locationId,
          role,
          daysOfWeek,
        },
      });

      return KarkunDuties.findOne(_id);
    },

    removeKarkunDuty: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          'You do not have permission to manage Karkun Duties in the System.'
        );
      }

      return KarkunDuties.remove(_id);
    },
  },
};
