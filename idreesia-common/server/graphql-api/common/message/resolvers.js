import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { getKarkunsByFilter as getMSKarkuns } from 'meteor/idreesia-common/server/graphql-api/hr/karkun/queries';
import { getOutstationKarkuns } from 'meteor/idreesia-common/server/graphql-api/outstation/karkun/queries';

export default {
  MessageType: {
    karkunCount: messageType =>
      messageType.karkunIds ? messageType.karkunIds.length : 0,

    visitorCount: messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,

    succeededMessageCount: messageType =>
      messageType.succeededPhoneNumbers
        ? messageType.succeededPhoneNumbers.length
        : 0,

    failedMessageCount: messageType =>
      messageType.failedPhoneNumbers
        ? messageType.failedPhoneNumbers.length
        : 0,
  },

  Query: {
    pagedMSKarkunMessageRecepients(obj, { recepientFilter }) {
      return getMSKarkuns(recepientFilter);
    },

    pagedMSKarkunMessageRecepientsByResult(obj, { recepientsByResultFilter }) {
      const { _id, succeeded, pageIndex, pageSize } = recepientsByResultFilter;
      const message = Messages.findOne(_id);
      const phoneNumbers = succeeded
        ? message.succeededPhoneNumbers
        : message.failedPhoneNumbers;
      return getMSKarkuns({
        phoneNumbers,
        pageIndex,
        pageSize,
      });
    },

    pagedOutstationKarkunMessageRecepients(obj, { recepientFilter }) {
      return getOutstationKarkuns(recepientFilter);
    },

    pagedVisitorMessageRecepients(obj, { recepientFilter }) {
      return Visitors.searchVisitors(recepientFilter);
    },
  },
};
