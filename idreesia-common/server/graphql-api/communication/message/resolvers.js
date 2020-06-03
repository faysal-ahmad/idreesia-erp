import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

import { getKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/hr/karkun/queries';

export default {
  Query: {
    commMessageById(obj, { _id }) {
      return Messages.findOne(_id);
    },

    pagedCommMessages(obj, { filter }) {
      return Messages.searchMessages({
        ...filter,
      });
    },
  },

  Mutation: {
    createCommMessage(obj, { messageBody, recepientFilter }, { user }) {
      return getKarkunsWithoutPagination(recepientFilter).then(karkuns => {
        const karkunIds = karkuns.map(karkun => karkun._id);
        const date = new Date();
        const messageId = Messages.insert({
          source: MessageSource.COMMUNICATION,
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

    updateCommMessage(obj, { _id, messageBody, recepientFilter }, { user }) {
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

      return getKarkunsWithoutPagination(recepientFilter).then(karkuns => {
        const karkunIds = karkuns.map(karkun => karkun._id);
        const date = new Date();
        Messages.update(
          {
            _id,
            source: MessageSource.COMMUNICATION,
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

    approveCommMessage(obj, { _id }, { user }) {
      const date = new Date();
      Messages.update(
        {
          _id,
          source: MessageSource.COMMUNICATION,
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

    deleteCommMessage(obj, { _id }) {
      const existingMessage = Messages.findOne(_id);
      if (existingMessage.status === MessageStatus.SENDING) {
        throw new Error(
          'This message cannot be deleted as it is currently being sent.'
        );
      }

      return Messages.remove({
        _id,
        source: MessageSource.COMMUNICATION,
      });
    },
  },
};
