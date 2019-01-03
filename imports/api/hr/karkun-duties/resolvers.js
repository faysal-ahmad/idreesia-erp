import moment from 'moment';

import { KarkunDuties, Duties, DutyLocations } from '/imports/lib/collections/hr';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

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
      { karkunId, dutyId, locationId, startTime, endTime, startDate, endDate, daysOfWeek },
      { userId }
    ) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to manage Karkun Duties in the System.');
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

      const mStartDate = moment(startDate);
      const mEndDate = moment(endDate);

      const newDuty = {
        karkunId,
        dutyId,
        locationId,
        startTime,
        endTime,
        startDate: mStartDate.isValid() ? mStartDate.toDate() : null,
        endDate: mEndDate.isValid() ? mEndDate.toDate() : null,
        daysOfWeek,
      };
      console.log(newDuty);
      const karkunDutyId = KarkunDuties.insert(newDuty);

      return KarkunDuties.findOne(karkunDutyId);
    },

    updateKarkunDuty(
      obj,
      { _id, karkunId, dutyId, locationId, startTime, endTime, daysOfWeek },
      { userId }
    ) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to manage Karkun Duties in the System.');
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

    removeKarkunDuty(obj, { _id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to manage Karkun Duties in the System.');
      }

      return KarkunDuties.remove(_id);
    },
  },
};
