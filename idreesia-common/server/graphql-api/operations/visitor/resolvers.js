import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOperationsVisitors(obj, { filter }) {
      return People.searchPeople(filter, {
        includeVisitors: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      }));
    },

    operationsVisitorById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },

    operationsVisitorsByCnic(obj, { cnicNumbers, partialCnicNumber }) {
      if (cnicNumbers.length > 0) {
        const person = People.findOne({
          cnicNumber: { $in: cnicNumbers },
        });
        return People.personToVisitor(person);
      }

      if (cnicNumbers.length > 0) {
        const people = People.find({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        }).fetch();
        return people.map(person => People.personToVisitor(person));
      }

      if (partialCnicNumber) {
        const people = People.find({
          'sharedData.cnicNumber': {
            $regex: new RegExp(`-${partialCnicNumber}-`, 'i'),
          },
        }).fetch();
        return people.map(person => People.personToVisitor(person));
      }

      return null;
    },
  },

  Mutation: {
    createOperationsVisitor(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          dataSource: DataSource.OPERATIONS,
        },
        user
      );
      return People.personToVisitor(person);
    },

    updateOperationsVisitor(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    deleteOperationsVisitor(obj, { _id }) {
      return People.remove(_id);
    },

    setOperationsVisitorImage(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },
  },
};
