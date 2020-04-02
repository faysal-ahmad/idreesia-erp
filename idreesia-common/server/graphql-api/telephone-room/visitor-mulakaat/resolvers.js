import moment from 'moment';
import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedTelephoneRoomVisitorMulakaats(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return VisitorMulakaats.getPagedData(filter);
    },

    telephoneRoomVisitorMulakaatById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return VisitorMulakaats.findOne(_id);
    },
  },

  Mutation: {
    createTelephoneRoomVisitorMulakaat(
      obj,
      { visitorId, mulakaatDate },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      if (!VisitorMulakaats.isMulakaatAllowed(visitorId, mulakaatDate)) {
        throw new Error(
          'Visitor already has done mulakaat in the last 7 days.'
        );
      }

      const mMulakaatDate = moment(mulakaatDate);
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

    cancelTelephoneRoomVisitorMulakaats(obj, { mulakaatDate }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
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
            cancelledBy: user._id,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    cancelTelephoneRoomVisitorMulakaat(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      const date = new Date();
      VisitorMulakaats.update(_id, {
        $set: {
          cancelledDate: date,
          cancelledBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorMulakaats.findOne(_id);
    },

    deleteTelephoneRoomVisitorMulakaat(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.TR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Visitors in the System.'
        );
      }

      return VisitorMulakaats.remove(_id);
    },
  },
};
