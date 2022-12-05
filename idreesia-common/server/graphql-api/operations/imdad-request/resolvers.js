import moment from 'moment';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';

export default {
  Query: {
    operationsImdadRequestById: async (obj, { _id }) =>
      ImdadRequests.findOne(_id),

    pagedOperationsImdadRequests: async (obj, { filter }) =>
      ImdadRequests.getPagedData(filter),
  },

  Mutation: {
    createOperationsVisitorImdadRequest: async (
      obj,
      { visitorId },
      { user }
    ) => {
      if (!ImdadRequests.isImdadRequestAllowed(visitorId)) {
        throw new Error(
          'Visitor already has submitted an imdad request in the last 30 days.'
        );
      }

      const date = new Date();
      const imdadRequestId = ImdadRequests.insert({
        visitorId,
        dataSource: DataSource.OPERATIONS,
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

    createOperationsImdadRequest: async (obj, values, { user }) =>
      ImdadRequests.createImdadRequest(
        {
          dataSource: DataSource.ACCOUNTS,
          ...values,
        },
        user
      ),

    updateOperationsImdadRequest: async (obj, values, { user }) =>
      ImdadRequests.updateImdadRequest(values, user),

    deleteOperationsImdadRequest: async (obj, { _id }) =>
      ImdadRequests.remove(_id),

    setOperationsApprovedImdad: async (obj, values, { user }) =>
      ImdadRequests.updateImdadRequest(values, user),

    addOperationsImdadRequestAttachment: async (obj, values, { user }) =>
      ImdadRequests.addAttachment(values, user),

    removeOperationsImdadRequestAttachment: async (obj, values, { user }) =>
      ImdadRequests.removeAttachment(values, user),
  },
};
