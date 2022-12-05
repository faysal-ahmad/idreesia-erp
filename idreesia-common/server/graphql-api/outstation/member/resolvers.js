import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationMembers: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      })),

    outstationMemberById: async (obj, { _id }) => {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    importOutstationMember: async (
      obj,
      {
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        cityId,
        ehadDate,
        birthDate,
        referenceName,
      },
      { user }
    ) => {
      // Check if we already have an existing visitor coresponding to these values
      // Create a new visitor corresponding to this member if one is not found
      const existingPerson = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber1
      );

      if (!existingPerson) {
        const city = Cities.findOne(cityId);
        const person = People.visitorToPerson({
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          city: city.name,
          country: city.country,
          ehadDate,
          birthDate,
          referenceName,
          dataSource: DataSource.OUTSTATION,
        });

        People.createPerson(person, user);
        return 'New member created.';
      }

      return 'Member already exists. Ignored.';
    },

    createOutstationMember: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          dataSource: DataSource.OUTSTATION,
        },
        user
      );
      return People.personToVisitor(person);
    },

    updateOutstationMember: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    deleteOutstationMember: async (obj, { _id }) => People.remove(_id),

    setOutstationMemberImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },
  },
};
