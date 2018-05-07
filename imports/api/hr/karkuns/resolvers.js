import { Karkuns } from '/imports/lib/collections/hr';

export default {
  KarkunType: {
    name: karkunType => {
      return `${karkunType.firstName} ${karkunType.lastName}`;
    }
  },

  Query: {
    allKarkuns() {
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
    }
  }
};
