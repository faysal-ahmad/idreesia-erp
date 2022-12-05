import moment from 'moment';

import { compact } from 'meteor/idreesia-common/utilities/lodash';
import {
  Duties,
  DutyShifts,
} from 'meteor/idreesia-common/server/collections/hr';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';

import { getVisitorStays, getTeamVisits } from './queries';

export default {
  VisitorStayType: {
    isValid: async visitorStay => {
      const toDate = moment(Number(visitorStay.toDate));
      return moment().isBefore(toDate);
    },
    isExpired: async visitorStay => {
      const toDate = moment(Number(visitorStay.toDate)).hour(18);
      return moment().isAfter(toDate);
    },
    refVisitor: async visitorStay => {
      const person = People.findOne({
        _id: { $eq: visitorStay.visitorId },
      });
      return People.personToVisitor(person);
    },
    dutyName: async visitorStay => {
      if (!visitorStay.dutyId) return null;
      const duty = Duties.findOne(visitorStay.dutyId);
      return duty ? duty.name : null;
    },
    shiftName: async visitorStay => {
      if (!visitorStay.shiftId) return null;
      const shift = DutyShifts.findOne(visitorStay.shiftId);
      return shift ? shift.name : null;
    },
    dutyShiftName: async visitorStay => {
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
    pagedVisitorStays: async (obj, { queryString }) =>
      getVisitorStays(queryString),

    pagedVisitorStaysByVisitorId: async (obj, { visitorId }) =>
      getVisitorStays(`?visitorId=${visitorId}&pageSize=5`),

    pagedTeamVisits: async (obj, { queryString }) => getTeamVisits(queryString),

    visitorStayById: async (obj, { _id }) => VisitorStays.findOne(_id),

    distinctStayAllowedBy: async () => {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction('stayAllowedBy'));
    },

    distinctTeamNames: async () => {
      const distincFunction = Meteor.wrapAsync(
        VisitorStays.rawCollection().distinct,
        VisitorStays.rawCollection()
      );

      return compact(distincFunction('teamName'));
    },
  },

  Mutation: {
    createVisitorStay: async (
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
    ) => {
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

    updateVisitorStay: async (
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
    ) => {
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

    fixNameSpelling: async (
      obj,
      { existingSpelling, newSpelling },
      { user }
    ) => {
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

    cancelVisitorStay: async (obj, { _id }, { user }) => {
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

    deleteVisitorStay: async (obj, { _id }) => VisitorStays.remove(_id),
  },
};
