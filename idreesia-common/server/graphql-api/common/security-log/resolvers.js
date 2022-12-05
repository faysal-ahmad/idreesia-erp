import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

export default {
  SecurityLogType: {
    userName: async securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.name;
      return user.displayName;
    },

    userImageId: async securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.imageId;
      return null;
    },

    operationByName: async securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.name;
      return user.displayName;
    },

    operationByImageId: async securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.imageId;
      return null;
    },
  },
};
