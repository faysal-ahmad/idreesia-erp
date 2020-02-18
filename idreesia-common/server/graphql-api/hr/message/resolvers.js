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
    hrMessageById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_MESSAGES,
          PermissionConstants.HR_MANAGE_MESSAGES,
          PermissionConstants.HR_APPROVE_MESSAGES,
        ])
      ) {
        return null;
      }

      return Messages.findOne({
        _id,
        source: MessageSource.HR,
      });
    },

    pagedHrMessages(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_MESSAGES,
          PermissionConstants.HR_MANAGE_MESSAGES,
          PermissionConstants.HR_APPROVE_MESSAGES,
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
    createHrMessage(obj, { messageBody, karkunFilter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_MESSAGES,
          PermissionConstants.HR_APPROVE_MESSAGES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Messages in the System.'
        );
      }

      const date = new Date();
      const messageId = Messages.insert({
        source: MessageSource.HR,
        messageBody,
        karkunFilter,
        status: MessageStatus.WAITING_APPROVAL,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Messages.findOne(messageId);
    },

    updateHrMessage(obj, { _id, messageBody, karkunFilter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_MESSAGES,
          PermissionConstants.HR_APPROVE_MESSAGES,
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
          source: MessageSource.HR,
        },
        {
          $set: {
            messageBody,
            karkunFilter,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Messages.findOne(_id);
    },

    approveHrMessage(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_APPROVE_MESSAGES])
      ) {
        throw new Error(
          'You do not have permission to approve Messages in the System.'
        );
      }

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

    deleteHrMessage(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_DELETE_DATA])) {
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
        source: MessageSource.HR,
      });
    },
  },
};
