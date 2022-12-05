import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      })),

    securityVisitorById: async (obj, { _id }) => {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },

    securityVisitorByCnic: async (obj, { cnicNumbers }) => {
      if (cnicNumbers.length > 0) {
        const person = People.findOne({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        });
        return People.personToVisitor(person);
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber: async (
      obj,
      { cnicNumber, contactNumber }
    ) => {
      const person = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber
      );
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    createSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          dataSource: DataSource.SECURITY,
        },
        user
      );
      return People.personToVisitor(person);
    },

    updateSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    deleteSecurityVisitor: async (obj, { _id }) => People.remove(_id),

    setSecurityVisitorImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    updateSecurityVisitorNotes: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    importSecurityVisitorsCsvData: async (obj, { csvData }, { user }) =>
      processCsvData(csvData, new Date(), user),
  },
};
