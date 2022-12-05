import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

export default {
  MessageType: {
    karkunCount: async messageType =>
      messageType.karkunIds ? messageType.karkunIds.length : 0,

    visitorCount: async messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,

    succeededMessageCount: async messageType =>
      messageType.succeededPhoneNumbers
        ? messageType.succeededPhoneNumbers.length
        : 0,

    failedMessageCount: async messageType =>
      messageType.failedPhoneNumbers
        ? messageType.failedPhoneNumbers.length
        : 0,
  },

  Query: {
    pagedMSKarkunMessageRecepients: async (obj, { recepientFilter }) => {
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
          includeEmployees: true,
        }
      ).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },

    pagedMSKarkunMessageRecepientsByResult: async (
      obj,
      { recepientsByResultFilter }
    ) => {
      const { _id, succeeded, pageIndex, pageSize } = recepientsByResultFilter;
      const multanCity = Cities.findOne({
        name: 'Multan',
        country: 'Pakistan',
      });
      const message = Messages.findOne(_id);
      const phoneNumbers = succeeded
        ? message.succeededPhoneNumbers
        : message.failedPhoneNumbers;

      return People.searchPeople(
        {
          cityId: multanCity._id,
          phoneNumbers,
          pageIndex,
          pageSize,
        },
        {
          includeKarkuns: true,
          includeEmployees: true,
        }
      ).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },

    pagedOutstationKarkunMessageRecepients: async (obj, { recepientFilter }) =>
      People.searchPeople(recepientFilter, {
        includeKarkuns: true,
        includeEmployees: false,
      }).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      })),

    pagedOutstationKarkunMessageRecepientsByResult: async (
      obj,
      { recepientsByResultFilter }
    ) => {
      const { _id, succeeded, pageIndex, pageSize } = recepientsByResultFilter;
      const message = Messages.findOne(_id);
      const phoneNumbers = succeeded
        ? message.succeededPhoneNumbers
        : message.failedPhoneNumbers;

      return People.searchPeople(
        {
          phoneNumbers,
          pageIndex,
          pageSize,
        },
        {
          includeKarkuns: true,
          includeEmployees: false,
        }
      ).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },

    pagedVisitorMessageRecepients: async (obj, { recepientFilter }) =>
      People.searchPeople(recepientFilter, {
        includeVisitors: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      })),
  },
};
