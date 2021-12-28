import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { personToVisitor, processCsvData, visitorToPerson } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { filter }) {
      return People.searchPeople(filter).then(result => ({
        data: result.data.map(person => personToVisitor(person)),
        totalResults: result.totalResults,
      }));
    },

    securityVisitorById(obj, { _id }) {
      const person = People.findOne(_id);
      return personToVisitor(person);
    },

    securityVisitorByCnic(obj, { cnicNumbers }) {
      if (cnicNumbers.length > 0) {
        const person = People.findOne({
          cnicNumber: { $in: cnicNumbers },
        });
        return personToVisitor(person);
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber(obj, { cnicNumber, contactNumber }) {
      const person = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber
      );
      return personToVisitor(person);
    },
  },

  Mutation: {
    createSecurityVisitor(obj, values, { user }) {
      const person = visitorToPerson(values);
      return People.createVisitor(
        {
          ...person,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor(obj, values, { user }) {
      const person = visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    deleteSecurityVisitor(obj, { _id }) {
      return People.remove(_id);
    },

    setSecurityVisitorImage(obj, values, { user }) {
      const person = visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    updateSecurityVisitorNotes(obj, values, { user }) {
      const person = visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    importSecurityVisitorsCsvData(obj, { csvData }, { user }) {
      return processCsvData(csvData, new Date(), user);
    },
  },
};
