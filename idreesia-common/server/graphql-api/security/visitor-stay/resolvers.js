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

import { getVisitorStays, getTeamVisits } from './queries';

export default {
  VisitorStayType: {
    isValid: visitorStay => {
      const toDate = moment(Number(visitorStay.toDate));
      return moment().isBefore(toDate);
    },
    isExpired: visitorStay => {
      const toDate = moment(Number(visitorStay.toDate)).hour(18);
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
    pagedVisitorStays(obj, { queryString }) {
      return getVisitorStays(queryString);
    },

    pagedVisitorStaysByVisitorId(obj, { visitorId }) {
      return getVisitorStays(`?visitorId=${visitorId}&pageSize=5`);
    },

    pagedTeamVisits(obj, { queryString }) {
      return getTeamVisits(queryString);
    },

    visitorStayById(obj, { _id }) {
      return VisitorStays.findOne(_id);
    },

    distinctStayAllowedBy() {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction('stayAllowedBy'));
    },

    distinctTeamNames() {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction('teamName'));
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
        teamName,
      },
      { user }
    ) {
      // We are going to assume that if the current time is before midnight, but
      // after 6 PM, then the stay is for the next day's date.
      // But if it is after midnight, then it is for the current date.
      const fromDate = moment();
      if (fromDate.hour() >= 18) fromDate.add(1, 'd');

      const toDate = fromDate.clone();
      if (numOfDays > 1) {
        toDate.add(numOfDays - 1, 'days');
      }

      // Before creating a stay, ensure that there isn't already another stay created
      // for the current date for this visitor.
      const existingStay = VisitorStays.findOne({
        visitorId,
        fromDate: fromDate.startOf('day').toDate(),
        cancelledDate: { $exists: false },
      });

      if (existingStay) {
        throw new Error('Visitor already has a stay for this date.');
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
        teamName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorStays.findOne(visitorStayId);
    },

    updateVisitorStay(
      obj,
      {
        _id,
        fromDate,
        toDate,
        stayReason,
        stayAllowedBy,
        dutyId,
        shiftId,
        teamName,
      },
      { user }
    ) {
      const mFromDate = moment(fromDate);
      const mToDate = moment(toDate);
      const numOfDays = mToDate.diff(mFromDate, 'days') + 1;

      const date = new Date();
      VisitorStays.update(_id, {
        $set: {
          fromDate: mFromDate.startOf('day').toDate(),
          toDate: mToDate.endOf('day').toDate(),
          numOfDays,
          stayReason,
          stayAllowedBy,
          dutyId,
          shiftId,
          teamName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorStays.findOne(_id);
    },

    fixNameSpelling(obj, { existingSpelling, newSpelling }, { user }) {
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

    deleteVisitorStay(obj, { _id }) {
      return VisitorStays.remove(_id);
    },
  },
};
