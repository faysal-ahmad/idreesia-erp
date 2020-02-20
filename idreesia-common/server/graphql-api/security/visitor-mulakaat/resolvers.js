import moment from 'moment';
import {
  Visitors,
  VisitorMulakaats,
} from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getVisitorMulakaats } from './queries';

export default {
  VisitorMulakaatType: {
    visitor: visitorMulakaat =>
      Visitors.findOne({
        _id: { $eq: visitorMulakaat.visitorId },
      }),
  },

  Query: {
    pagedVisitorMulakaats(obj, { filter }, { user }) {
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

      return getVisitorMulakaats(filter);
    },

    visitorMulakaatById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return VisitorMulakaats.findOne(_id);
    },
  },

  Mutation: {
    createVisitorMulakaat(obj, { visitorId, mulakaatDate }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      const mMulakaatDate = moment(mulakaatDate);
      // Before creating, ensure that there isn't already another record created
      // for the week of this date for this visitor.
      const weekDate = mMulakaatDate.clone().startOf('isoWeek');
      const weekDates = [weekDate.toDate()];
      for (let i = 1; i < 7; i++) {
        weekDate.add(1, 'day');
        weekDates.push(weekDate.toDate());
      }

      const existingMulakaat = VisitorMulakaats.findOne({
        visitorId,
        mulakaatDate: { $in: weekDates },
        cancelledDate: { $exists: false },
      });

      if (existingMulakaat) {
        throw new Error('Visitor already has a mulakaat for this week.');
      }

      const date = new Date();
      const visitorMulakaatId = VisitorMulakaats.insert({
        visitorId,
        mulakaatDate: mMulakaatDate.startOf('day').toDate(),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorMulakaats.findOne(visitorMulakaatId);
    },

    cancelMulakaats(obj, { mulakaatDate }, { user }) {
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
      const mMulakaatDate = moment(mulakaatDate);
      return VisitorMulakaats.update(
        {
          mulakaatDate: mMulakaatDate.startOf('day').toDate(),
        },
        {
          $set: {
            cancelledDate: date,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    cancelVisitorMulakaat(obj, { _id }, { user }) {
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
      VisitorMulakaats.update(_id, {
        $set: {
          cancelledDate: date,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorMulakaats.findOne(_id);
    },

    deleteVisitorMulakaat(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.SECURITY_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      return VisitorMulakaats.remove(_id);
    },
  },
};
