import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationMembers(obj, { filter }) {
      return People.searchPeople(filter, {
        excludeKarkuns: true,
        excludeEmployees: true,
      }).then(result => ({
        data: result.data.map(person => People.personToVisitor(person)),
        totalResults: result.totalResults,
      }));
    },

    outstationMemberById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    importOutstationMember(
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
    ) {
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

    createOutstationMember(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.createVisitor(
        {
          ...person,
          dataSource: DataSource.OUTSTATION,
        },
        user
      );
    },

    updateOutstationMember(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },

    deleteOutstationMember(obj, { _id }) {
      return People.remove(_id);
    },

    setOutstationMemberImage(obj, values, { user }) {
      const person = People.visitorToPerson(values);
      return People.updatePerson(person, user);
    },
  },
};
