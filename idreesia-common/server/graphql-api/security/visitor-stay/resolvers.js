import moment from 'moment';

import { compact } from 'meteor/idreesia-common/utilities/lodash';
import {
  Duties,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  Visitors,
  VisitorStays,
} from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getVisitorStays } from './queries';

export default {
  VisitorStayType: {
    isValid: visitorStay => {
      const toDate = moment(Number(visitorStay.toDate));
      return moment().isBefore(toDate);
    },
    isExpired: visitorStay => {
      const toDate = moment(Number(visitorStay.toDate));
      return moment().isAfter(toDate);
    },
    refVisitor: visitorStay =>
      Visitors.findOne({
        _id: { $eq: visitorStay.visitorId },
      }),
    dutyName: visitorStay => {
      if (!visitorStay.dutyId) return null;
      const duty = Duties.findOne(visitorStay.dutyId);
      return duty ? duty.name : null;
    },
    shiftName: visitorStay => {
      if (!visitorStay.shiftId) return null;
      const shift = DutyShifts.findOne(visitorStay.shiftId);
      return shift ? shift.name : null;
    },
    dutyShiftName: visitorStay => {
      if (!visitorStay.dutyId) return null;
      const duty = Duties.findOne(visitorStay.dutyId);
      const shift = visitorStay.shiftId
        ? DutyShifts.findOne(visitorStay.shiftId)
        : null;

      if (!shift) return duty.name;
      return `${duty.name} - ${shift.name}`;
    },
  },
  Query: {
    pagedVisitorStays(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getVisitorStays(queryString);
    },

    visitorStayById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return VisitorStays.findOne(_id);
    },

    distinctStayAllowedBy() {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction('stayAllowedBy'));
    },
  },

  Mutation: {
    createVisitorStay(
      obj,
      {
        visitorId,
        numOfDays,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        notes,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      // We are going to assume that if the current time is before midnight, but
      // after 6 PM, then the stay is for the next day's date.
      // But if it is after midnight, then it is for the current date.
      const fromDate = moment();
      if (fromDate.hour() >= 18) fromDate.add(1, 'd');

      const toDate = fromDate.clone();
      if (numOfDays > 1) {
        toDate.add(numOfDays - 1, 'days');
      }

      const date = new Date();
      const visitorStayId = VisitorStays.insert({
        visitorId,
        fromDate: fromDate.startOf('day').toDate(),
        toDate: toDate.endOf('day').toDate(),
        numOfDays,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorStays.findOne(visitorStayId);
    },

    updateVisitorStay(
      obj,
      { _id, numOfDays, stayReason, stayAllowedBy, dutyId, shiftId, notes },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      const existingStay = VisitorStays.findOne(_id);
      const fromDate = moment(Number(existingStay.fromDate));
      const toDate = fromDate.clone();
      if (numOfDays > 1) {
        toDate.add(numOfDays - 1, 'days');
      }

      const date = new Date();
      VisitorStays.update(_id, {
        $set: {
          toDate: toDate.endOf('day').toDate(),
          numOfDays,
          stayReason,
          stayAllowedBy,
          dutyId,
          shiftId,
          notes,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorStays.findOne(_id);
    },

    fixNameSpelling(obj, { existingSpelling, newSpelling }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      const date = new Date();
      const count = VisitorStays.update(
        {
          stayAllowedBy: { $eq: existingSpelling },
        },
        {
          $set: {
            stayAllowedBy: newSpelling,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );

      return count;
    },

    cancelVisitorStay(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      const date = new Date();
      VisitorStays.update(_id, {
        $set: {
          cancelledDate: date,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorStays.findOne(_id);
    },

    deleteVisitorStay(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return VisitorStays.remove(_id);
    },
  },
};
