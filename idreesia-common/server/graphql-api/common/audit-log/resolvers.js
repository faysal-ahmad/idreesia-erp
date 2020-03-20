import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

export default {
  AuditLogType: {
    operationByName: auditLogType => {
      const user = Users.findOneUser(auditLogType.operationBy);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.name;
      return user.displayName;
    },

    operationByImageId: auditLogType => {
      const user = Users.findOneUser(auditLogType.operationBy);
      const karkun = user.karkunId ? Karkuns.findOne(user.karkunId) : null;
      if (karkun) return karkun.imageId;
      return null;
    },
  },
};
