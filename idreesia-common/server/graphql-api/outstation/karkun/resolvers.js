import { Accounts } from 'meteor/accounts-base';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    outstationKarkunById: async (obj, { _id }) => {
      const person = People.findOne(_id);
      return People.personToKarkun(person);
    },

    pagedOutstationKarkuns: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeKarkuns: true,
      }).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      })),
  },

  Mutation: {
    importOutstationKarkun: async (obj, values, { user }) => {
      // Do we have an existing karkun corresponding to the passed values
      // Use cnic and contact number to lookup existing karkun.
      const { cnicNumber, contactNumber1 } = values;
      const existingPerson = People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber1
      );

      if (!existingPerson) {
        // Create a karkun from using the passed values
        const personValues = People.karkunToPerson({
          ...values,
          isKarkun: true,
          isVisitor: true,
          dataSource: DataSource.OUTSTATION,
        });
        People.createPerson(personValues, user);
        return 'New karkun created.';
      }

      return 'Karkun already exists. Ignored.';
    },

    createOutstationKarkun: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          isKarkun: true,
          isVisitor: true,
          dataSource: DataSource.OUTSTATION,
        },
        user
      );

      return People.personToKarkun(person);
    },

    updateOutstationKarkun: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    deleteOutstationKarkuns: async (obj, { _ids }) => {
      await _ids.reduce(
        (prevPromise, _id) =>
          prevPromise.then(() => {
            if (canDeleteKarkun(_id)) {
              return deleteKarkun(_id);
            }
          }),
        Promise.resolve()
      );

      return 1;
    },

    setOutstationKarkunWazaifAndRaabta: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setOutstationKarkunEhadDuty: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setOutstationKarkunProfileImage: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    createOutstationKarkunUserAccount: async (obj, { _id, email }) => {
      // Ensure that this karkun does not alredy have an account
      const existingUser = Users.findOne({ personId: _id });
      if (existingUser) {
        throw new Error(`This person already has a user account.`);
      }

      // Check if this email is already registered for a user
      const user = await Accounts.findUserByEmail(email);
      if (user) {
        throw new Error('This email address is already registered.');
      }

      const userId = await Accounts.createUserAsync({ email });
      if (userId) {
        Accounts.sendEnrollmentEmail(userId);
        // Set the personId in the newly created User
        await Users.updateAsync(userId, {
          $set: { personId: _id },
        });
      }

      const person = await People.findOneAsync(_id);
      return People.personToKarkun(person);
    },
  },
};
