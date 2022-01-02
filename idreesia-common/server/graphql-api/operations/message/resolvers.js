import { People } from 'meteor/idreesia-common/server/collections/common';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    operationsMessageById(obj, { _id }) {
      return Messages.findOne(_id);
    },

    pagedOperationsMessages(obj, { filter }) {
      return Messages.searchMessages({
        ...filter,
      });
    },
  },

  Mutation: {
    createOperationsMessage(obj, { messageBody, recepientFilter }, { user }) {
      return People.searchPeople(recepientFilter, {
        includeKarkuns: true,
        paginatedResults: false,
      }).then(people => {
        const karkunIds = people.map(person => person._id);
        const date = new Date();
        const messageId = Messages.insert({
          source: MessageSource.OPERATIONS,
          messageBody,
          recepientFilters: [recepientFilter],
          status: MessageStatus.WAITING_APPROVAL,
          karkunIds,
          createdAt: date,
          createdBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        });

        return Messages.findOne(messageId);
      });
    },

    updateOperationsMessage(
      obj,
      { _id, messageBody, recepientFilter },
      { user }
    ) {
      const existingMessage = Messages.findOne(_id);
      if (existingMessage.status === MessageStatus.SENDING) {
        throw new Error(
          'This message cannot be updated as it is currently being sent.'
        );
      }
      if (existingMessage.status === MessageStatus.SENT) {
        throw new Error(
          'This message cannot be edited as it has already been sent.'
        );
      }

      return People.searchPeople(recepientFilter, {
        includeKarkuns: true,
        paginatedResults: false,
      }).then(people => {
        const karkunIds = people.map(person => person._id);
        const date = new Date();
        Messages.update(
          {
            _id,
            source: MessageSource.OPERATIONS,
          },
          {
            $set: {
              messageBody,
              recepientFilters: [recepientFilter],
              karkunIds,
              updatedAt: date,
              updatedBy: user._id,
            },
          }
        );

        return Messages.findOne(_id);
      });
    },

    approveOperationsMessage(obj, { _id }, { user }) {
      const date = new Date();
      Messages.update(
        {
          _id,
          source: MessageSource.OPERATIONS,
        },
        {
          $set: {
            status: MessageStatus.APPROVED,
            approvedOn: date,
            approvedBy: user._id,
          },
        }
      );

      const params = { messageId: _id };
      const options = { priority: 'normal', retry: 10 };
      createJob({ type: JobTypes.SEND_SMS_MESSAGE, params, options });
      return Messages.findOne(_id);
    },

    deleteOperationsMessage(obj, { _id }) {
      const existingMessage = Messages.findOne(_id);
      if (existingMessage.status === MessageStatus.SENDING) {
        throw new Error(
          'This message cannot be deleted as it is currently being sent.'
        );
      }

      return Messages.remove({
        _id,
        source: MessageSource.OPERATIONS,
      });
    },
  },
};
