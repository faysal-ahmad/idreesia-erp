import { People } from 'meteor/idreesia-common/server/collections/common';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    hrMessageById(obj, { _id }) {
      return Messages.findOne({
        _id,
        source: MessageSource.HR,
      });
    },

    pagedHrMessages(obj, { filter }) {
      return Messages.searchMessages({
        ...filter,
        source: MessageSource.HR,
      });
    },
  },

  Mutation: {
    createHrMessage(obj, { messageBody, recepientFilter }, { user }) {
      const multanCity = Cities.findOne({
        name: 'Multan',
        country: 'Pakistan',
      });

      return People.searchPeople(
        {
          ...recepientFilter,
          cityId: multanCity._id,
        },
        {
          includeKarkuns: true,
          paginatedResults: false,
        }
      ).then(people => {
        const karkunIds = people.map(person => person._id);
        const date = new Date();
        const messageId = Messages.insert({
          source: MessageSource.HR,
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

    updateHrMessage(obj, { _id, messageBody, recepientFilter }, { user }) {
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

      const multanCity = Cities.findOne({
        name: 'Multan',
        country: 'Pakistan',
      });

      return People.searchPeople(
        {
          ...recepientFilter,
          cityId: multanCity._id,
        },
        {
          includeKarkuns: true,
          paginatedResults: false,
        }
      ).then(people => {
        const karkunIds = people.map(person => person._id);
        const date = new Date();
        Messages.update(
          {
            _id,
            source: MessageSource.HR,
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

    approveHrMessage(obj, { _id }, { user }) {
      const date = new Date();
      Messages.update(
        {
          _id,
          source: MessageSource.HR,
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

    deleteHrMessage(obj, { _id }) {
      const existingMessage = Messages.findOne(_id);
      if (existingMessage.status === MessageStatus.SENDING) {
        throw new Error(
          'This message cannot be deleted as it is currently being sent.'
        );
      }

      return Messages.remove({
        _id,
        source: MessageSource.HR,
      });
    },
  },
};
