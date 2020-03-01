import moment from 'moment';
import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedSecurityVisitorMulakaats(obj, { filter }, { user }) {
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

      return VisitorMulakaats.getPagedData(filter);
    },

    securityVisitorMulakaatById(obj, { _id }, { user }) {
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
    createSecurityVisitorMulakaat(obj, { visitorId, mulakaatDate }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
        );
      }

      // Before creating, ensure that there isn't already another record created
      // for the week of this date for this visitor.
      if (!VisitorMulakaats.isMulakaatAllowed(visitorId, mulakaatDate)) {
        throw new Error('Visitor already has a mulakaat for this week.');
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

    cancelSecurityVisitorMulakaats(obj, { mulakaatDate }, { user }) {
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
            cancelledBy: user._id,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    cancelSecurityVisitorMulakaat(obj, { _id }, { user }) {
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
          cancelledBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorMulakaats.findOne(_id);
    },

    deleteSecurityVisitorMulakaat(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.SECURITY_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to delete Visitors in the System.'
        );
      }

      return VisitorMulakaats.remove(_id);
    },
  },
};
