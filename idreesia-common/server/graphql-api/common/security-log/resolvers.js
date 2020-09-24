import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

export default {
  SecurityLogType: {
    userName: securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.name;
      return user.displayName;
    },

    userImageId: securityLogType => {
      const user = Users.findOneUser(securityLogType.userId);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.imageId;
      return null;
    },

    operationByName: securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.name;
      return user.displayName;
    },

    operationByImageId: securityLogType => {
      const user = Users.findOneUser(securityLogType.operationBy);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.imageId;
      return null;
    },
  },
};
