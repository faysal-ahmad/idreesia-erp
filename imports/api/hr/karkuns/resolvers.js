import { Duties, Karkuns, KarkunDuties } from '/imports/lib/collections/hr';

export default {
  KarkunType: {
    name: karkunType => {
      return `${karkunType.firstName} ${karkunType.lastName}`;
    },
    user: karkunType => {
      if (!karkunType.userId) return null;
      return Meteor.users.findOne(karkunType.userId);
    },
    duties: karkunType => {
      const karkunDuties = KarkunDuties.find({
        karkunId: { $eq: karkunType._id }
      }).fetch();

      if (karkunDuties.length > 0) {
        const dutyIds = karkunDuties.map(karkunDuty => karkunDuty.dutyId);
        const duties = Duties.find({
          _id: { $in: dutyIds }
        }).fetch();

        const dutyNames = duties.map(duty => duty.name);
        return dutyNames.join(', ');
      } else {
        return null;
      }
    }
  },

  Query: {
    allKarkunsWithAccounts() {
      return Karkuns.find({
        userId: { $ne: null }
      }).fetch();
    },
    allKarkunsWithNoAccounts() {
      return Karkuns.find({
        userId: { $eq: null }
      }).fetch();
    },

    allKarkuns(obj, { name, cnicNumber, duties }, context) {
      // db.coll.find({$expr:{$eq:["value", {$concat:["$field1", "$field2"]}]}})
      let filterCriteria = {};

      if (duties) {
      }
      return Karkuns.find({}).fetch();
    },

    karkunById(obj, { _id }, context) {
      return Karkuns.findOne(_id);
    }
  },

  Mutation: {
    createKarkun(obj, { firstName, lastName, cnicNumber, address }, { userId }) {
      const existingKarkun = Karkuns.findOne({ cnicNumber: { $eq: cnicNumber } });
      if (existingKarkun) {
        throw Error(
          `This CNIC number is already set for ${existingKarkun.firstName} ${
            existingKarkun.lastName
          }.`
        );
      }

      const date = new Date();
      const karkunId = Karkuns.insert({
        firstName,
        lastName,
        cnicNumber,
        address,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return Karkuns.findOne(karkunId);
    },

    updateKarkun(obj, { _id, firstName, lastName, cnicNumber, address }, { userId }) {
      const existingKarkun = Karkuns.findOne({ cnicNumber: { $eq: cnicNumber } });
      if (existingKarkun && existingKarkun._id !== _id) {
        throw Error(
          `This CNIC number is already set for ${existingKarkun.firstName} ${
            existingKarkun.lastName
          }.`
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          firstName,
          lastName,
          cnicNumber,
          address,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return Karkuns.findOne(_id);
    },

    setProfilePicture(obj, { _id, profilePicture }, { userId }) {
      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          profilePicture,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return Karkuns.findOne(_id);
    },

    createAccount(obj, { karkunId, userName, password }, { userId }) {
      const existingUser = Accounts.findUserByUsername(userName);
      if (existingUser) {
        throw new Error(`User name '${userName}' is already in use.`);
      }

      const newUserId = Accounts.createUser({
        username: userName,
        password
      });

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: newUserId,
          updatedAt: time
        }
      });

      return Karkuns.findOne(karkunId);
    },

    deleteAccount(obj, { karkunId, karkunUserId }, { userId }) {
      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: null,
          updatedAt: time
        }
      });

      Meteor.users.remove(karkunUserId);
      return Karkuns.findOne(karkunId);
    },

    setPermissions(obj, { karkunId, karkunUserId, permissions }, { userId }) {
      Meteor.users.update(karkunUserId, { $set: { permissions } });
      return Karkuns.findOne(karkunId);
    }
  }
};
