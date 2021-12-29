import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { filter }) {
      return People.searchPeople(filter).then(result => ({
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
      const person = People.visitorToPerson(values);
      return People.createVisitor(
        {
          ...person,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    deleteSecurityVisitor(obj, { _id }) {
      return People.remove(_id);
    },

    setSecurityVisitorImage(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    updateSecurityVisitorNotes(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    importSecurityVisitorsCsvData(obj, { csvData }, { user }) {
      return processCsvData(csvData, new Date(), user);
    },
  },
};
