import moment from 'moment';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';
import { RequestStatus } from 'meteor/idreesia-common/constants/imdad';

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

      const date = new Date();
      const imdadRequestId = ImdadRequests.insert({
        visitorId,
        dataSource: DataSource.TELEPHONE_ROOM,
        requestDate: moment()
          .startOf('day')
          .toDate(),
        status: RequestStatus.CREATED,
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
