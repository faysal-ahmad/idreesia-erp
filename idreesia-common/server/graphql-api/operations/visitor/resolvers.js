import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOperationsVisitors: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      })),

    operationsVisitorById: async (obj, { _id }) => {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },

    operationsVisitorsByCnic: async (
      obj,
      { cnicNumbers, partialCnicNumber }
    ) => {
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
    createOperationsVisitor: async (obj, values, { user }) => {
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

    updateOperationsVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    deleteOperationsVisitor: async (obj, { _id }) => People.remove(_id),

    setOperationsVisitorImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },
  },
};
