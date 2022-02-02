import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { filter }) {
      return People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      }));
    },

    securityVisitorById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },

    securityVisitorByCnic(obj, { cnicNumbers }) {
      if (cnicNumbers.length > 0) {
        const person = People.findOne({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        });
        return People.personToVisitor(person);
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber(obj, { cnicNumber, contactNumber }) {
      const person = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber
      );
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    createSecurityVisitor(obj, values, { user }) {
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

    updateSecurityVisitor(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    deleteSecurityVisitor(obj, { _id }) {
      return People.remove(_id);
    },

    setSecurityVisitorImage(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    updateSecurityVisitorNotes(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    importSecurityVisitorsCsvData(obj, { csvData }, { user }) {
      return processCsvData(csvData, new Date(), user);
    },
  },
};
