import {
  KarkunDuties,
  Duties,
  DutyLocations,
} from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  KarkunDutyType: {
    dutyName: karkunDutyType => {
      const duty = Duties.findOne(karkunDutyType.dutyId);
      return duty ? duty.name : null;
    },
    locationName: karkunDutyType => {
      if (!karkunDutyType.locationId) return null;
      const location = DutyLocations.findOne(karkunDutyType.locationId);
      return location ? location.name : null;
    },
  },

  Query: {
    karkunDutiesByKarkunId(obj, { karkunId }) {
      return KarkunDuties.find({
        karkunId: { $eq: karkunId },
      }).fetch();
    },
    karkunDutyById(obj, { _id }) {
      return KarkunDuties.findOne(_id);
    },
  },

  Mutation: {
    createKarkunDuty(
      obj,
      { karkunId, dutyId, locationId, startTime, endTime, daysOfWeek },
      { user }
    ) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          "You do not have permission to manage Karkun Duties in the System."
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
        locationId,
        startTime,
        endTime,
        daysOfWeek,
      };
      const karkunDutyId = KarkunDuties.insert(newDuty);
      return KarkunDuties.findOne(karkunDutyId);
    },

    updateKarkunDuty(
      obj,
      { _id, karkunId, dutyId, locationId, startTime, endTime, daysOfWeek },
      { user }
    ) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          "You do not have permission to manage Karkun Duties in the System."
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
          locationId,
          startTime,
          endTime,
          daysOfWeek,
        },
      });

      return KarkunDuties.findOne(_id);
    },

    removeKarkunDuty(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error(
          "You do not have permission to manage Karkun Duties in the System."
        );
      }

      return KarkunDuties.remove(_id);
    },
  },
};
