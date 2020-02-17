import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { MessageStatus } from 'meteor/idreesia-common/constants/communication';

import { getMessages } from './queries';

export default {
  MessageType: {
    karkunCount: messageType =>
      messageType.karkunIds ? messageType.karkunIds.length : 0,
    visitorCount: messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,
  },

  Query: {
    messageById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.COMM_VIEW_MESSAGES,
          PermissionConstants.COMM_MANAGE_MESSAGES,
          PermissionConstants.COMM_APPROVE_MESSAGES,
        ])
      ) {
        return null;
      }

      return Messages.findOne(_id);
    },

    pagedMessages(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.COMM_VIEW_MESSAGES,
          PermissionConstants.COMM_MANAGE_MESSAGES,
          PermissionConstants.COMM_APPROVE_MESSAGES,
        ])
      ) {
        return {
          data: [],
          totalResuts: 0,
        };
      }

      return getMessages(queryString);
    },
  },

  Mutation: {
    createMessage(obj, { source, messageBody, karkunFilter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.COMM_MANAGE_MESSAGES,
          PermissionConstants.COMM_APPROVE_MESSAGES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Messages in the System.'
        );
      }

      const date = new Date();
      const messageId = Messages.insert({
        source,
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

    updateMessage(obj, { _id, messageBody, karkunFilter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.COMM_MANAGE_MESSAGES,
          PermissionConstants.COMM_APPROVE_MESSAGES,
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
      Messages.update(_id, {
        $set: {
          messageBody,
          karkunFilter,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Messages.findOne(_id);
    },

    approveMessage(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.COMM_APPROVE_MESSAGES])
      ) {
        throw new Error(
          'You do not have permission to approve Messages in the System.'
        );
      }

      const date = new Date();
      Messages.update(_id, {
        $set: {
          status: MessageStatus.APPROVED,
          approvedOn: date,
          approvedBy: user._id,
        },
      });

      return Messages.findOne(_id);
    },

    deleteMessage(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.COMM_MANAGE_MESSAGES,
          PermissionConstants.COMM_APPROVE_MESSAGES,
        ])
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

      return Messages.remove(_id);
    },
  },
};
