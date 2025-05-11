import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationPortalUsers: async (obj, { filter }) => {
      // const portals = Portals.find({}).fetch();
      // const portalIds = portals.map(portal => portal._id);
      return Users.searchOutstationPortalUsers(filter);
    },

    outstationPortalUserById: async (obj, { _id }) => {
      const user = Users.findOneUser(_id);
      return user;
    },
  },

  Mutation: {
    createOutstationPortalUser: async (obj, { portalId, email, karkunId }) => {
      // Ensure that this karkun does not alredy have an account
      const existingUser = Users.findOne({ personId: karkunId });
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
          $set: {
            personId: karkunId,
            instances: [portalId],
          },
        });
      }

      const person = await People.findOneAsync(karkunId);
      return People.personToKarkun(person);
    },

    updateOutstationPortalUser: async (
      obj,
      { userId, email, portalId },
      { user }
    ) => {
      const _user = Users.findOneUser(userId);
      // const karkunInPortal = isKarkunInPortal(_user.karkunId, portalId);
      /* if (!karkunInPortal) {
        throw new Error(
          `This karkun does not belong to any city in the portal.`
        );
      } */

      if (!_user.instances || _user.instances.indexOf(portalId) === -1) {
        Users.addInstanceAccess(
          {
            userId,
            instances: [portalId],
          },
          user,
          DataSource.OUTSTATION
        );
      }

      // Update the email if it is not set previously, or has
      // not been verified yet.
      if (_user.email && _user.emailVerified !== true) {
        await Users.updateAsync(userId, {
          $set: {
            'emails.0.address': email,
          },
        });
      } else {
        console.log('Skip email update.');
      }

      return Users.findOneUser(userId);
    },

    lockOutstationPortalUser: async (obj, { userId }, { user }) =>
      Users.updateUser({ userId, locked: true }, user, DataSource.OUTSTATION),

    unlockOutstationPortalUser: async (obj, { userId }, { user }) =>
      Users.updateUser({ userId, locked: false }, user, DataSource.OUTSTATION),
  },
};
