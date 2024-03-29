import { People } from 'meteor/idreesia-common/server/collections/common';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

import { getMessages } from './queries';

export default {
  Query: {
    outstationMessageById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_VIEW_MESSAGES,
          PermissionConstants.OUTSTATION_MANAGE_MESSAGES,
          PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        ])
      ) {
        return null;
      }

      return Messages.findOne({
        _id,
        source: MessageSource.OUTSTATION,
      });
    },

    pagedOutstationMessages: async (obj, { filter }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_VIEW_MESSAGES,
          PermissionConstants.OUTSTATION_MANAGE_MESSAGES,
          PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        ])
      ) {
        return {
          data: [],
          totalResuts: 0,
        };
      }

      return getMessages(filter);
    },
  },

  Mutation: {
    createOutstationMessage: async (
      obj,
      { messageBody, recepientFilter },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_MANAGE_MESSAGES,
          PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Messages in the System.'
        );
      }

      return People.searchPeople(recepientFilter, {
        includeKarkuns: true,
        paginatedResults: false,
      }).then(people => {
        const karkunIds = people.map(person => person._id);
        const date = new Date();
        const messageId = Messages.insert({
          source: MessageSource.OUTSTATION,
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

    updateOutstationMessage: async (
      obj,
      { _id, messageBody, recepientFilter },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_MANAGE_MESSAGES,
          PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Messages in the System.'
        );
      }

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

      const date = new Date();
      Messages.update(
        {
          _id,
          source: MessageSource.OUTSTATION,
        },
        {
          $set: {
            messageBody,
            recepientFilters: [recepientFilter],
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Messages.findOne(_id);
    },

    approveOutstationMessage: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        ])
      ) {
        throw new Error(
          'You do not have permission to approve Messages in the System.'
        );
      }

      const date = new Date();
      Messages.update(
        {
          _id,
          source: MessageSource.OUTSTATION,
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

    deleteOutstationMessage: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.OUTSTATION_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to delete Messages in the System.'
        );
      }

      const existingMessage = Messages.findOne(_id);
      if (existingMessage.status === MessageStatus.SENDING) {
        throw new Error(
          'This message cannot be deleted as it is currently being sent.'
        );
      }

      return Messages.remove({
        _id,
        source: MessageSource.OUTSTATION,
      });
    },
  },
};
