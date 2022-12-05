import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

export default {
  AuditLogType: {
    operationByName: async auditLogType => {
      const user = Users.findOneUser(auditLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.name;
      return user.displayName;
    },

    operationByImageId: async auditLogType => {
      const user = Users.findOneUser(auditLogType.operationBy);
      const person = user.personId ? People.findOne(user.personId) : null;
      if (person) return person.sharedData.imageId;
      return null;
    },
  },
};
