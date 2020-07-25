import moment from 'moment';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';

export default {
  Query: {
    operationsImdadRequestById(obj, { _id }) {
      return ImdadRequests.findOne(_id);
    },

    pagedOperationsImdadRequests(obj, { filter }) {
      return ImdadRequests.getPagedData(filter);
    },
  },

  Mutation: {
    createOperationsVisitorImdadRequest(obj, { visitorId }, { user }) {
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

    createOperationsImdadRequest(obj, values, { user }) {
      return ImdadRequests.createImdadRequest(
        {
          dataSource: DataSource.ACCOUNTS,
          ...values,
        },
        user
      );
    },

    updateOperationsImdadRequest(obj, values, { user }) {
      return ImdadRequests.updateImdadRequest(values, user);
    },

    deleteOperationsImdadRequest(obj, { _id }) {
      return ImdadRequests.remove(_id);
    },

    setOperationsApprovedImdad(obj, values, { user }) {
      return ImdadRequests.updateImdadRequest(values, user);
    },

    addOperationsImdadRequestAttachment(obj, values, { user }) {
      return ImdadRequests.addAttachment(values, user);
    },

    removeOperationsImdadRequestAttachment(obj, values, { user }) {
      return ImdadRequests.removeAttachment(values, user);
    },
  },
};
