import moment from 'moment';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/accounts';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/accounts';

export default {
  Query: {
    pagedTelephoneRoomImdadRequests(obj, { filter }, { user }) {
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

      return ImdadRequests.getPagedData(filter);
    },
  },

  Mutation: {
    createTelephoneRoomImdadRequest(obj, { visitorId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Imdad Requests in the System.'
        );
      }

      if (!ImdadRequests.isImdadRequestAllowed(visitorId)) {
        throw new Error(
          'Visitor already has submitted an imdad request in the last 30 days.'
        );
      }

      const date = new Date();
      const imdadRequestId = ImdadRequests.insert({
        visitorId,
        dataSource: DataSource.TELEPHONE_ROOM,
        requestDate: moment()
          .startOf('day')
          .toDate(),
        status: ImdadRequestStatus.CREATED,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return ImdadRequests.findOne(imdadRequestId);
    },

    deleteTelephoneRoomImdadRequest(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.TR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Imdad Requests in the System.'
        );
      }

      return ImdadRequests.remove(_id);
    },
  },
};
