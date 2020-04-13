import moment from 'moment';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/accounts';

export default {
  Query: {
    pagedTelephoneRoomImdadRequests(obj, { filter }) {
      return ImdadRequests.getPagedData(filter);
    },
  },

  Mutation: {
    createTelephoneRoomImdadRequest(obj, { visitorId }, { user }) {
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

    deleteTelephoneRoomImdadRequest(obj, { _id }) {
      return ImdadRequests.remove(_id);
    },
  },
};
