import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

export default {
  SecurityLogType: {
    userName: securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.name;
      return user.displayName;
    },

    userImageId: securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.imageId;
      return null;
    },

    operationByName: securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.name;
      return user.displayName;
    },

    operationByImageId: securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.imageId;
      return null;
    },
  },
};
