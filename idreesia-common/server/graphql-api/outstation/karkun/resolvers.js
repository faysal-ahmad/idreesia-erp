import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';

import { getOutstationKarkuns } from './queries';

export default {
  Query: {
    outstationKarkunById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToKarkun(person);
    },

    pagedOutstationKarkuns(obj, { filter }) {
      return getOutstationKarkuns(filter);
    },
  },

  Mutation: {
    importOutstationKarkun(obj, values, { user }) {
      // Do we have an existing karkun corresponding to the passed values
      // Use cnic and contact number to lookup existing karkun.
      const { cnicNumber, contactNumber1 } = values;
      const existingPerson = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber1
      );

      if (!existingPerson) {
        // Create a karkun from using the passed values
        const personValues = People.karkunToPerson(values);
        People.createPerson(personValues, user);
        return 'New karkun created.';
      }

      return 'Karkun already exists. Ignored.';
    },

    updateOutstationKarkun(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    deleteOutstationKarkun(obj, { _id }) {
      if (canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setOutstationKarkunWazaifAndRaabta(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setOutstationKarkunEhadDuty(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setOutstationKarkunProfileImage(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },
  },
};
