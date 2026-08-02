import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

interface AuditLogType {
  operationBy: string;
}

interface PersonRecord {
  sharedData?: {
    name?: string;
    imageId?: string;
  };
}

export default {
  AuditLogType: {
    operationByName: async (auditLogType: AuditLogType) => {
      const user = await Users.findOneUser(auditLogType.operationBy);
      const person = user.personId
        ? ((await People.findOneAsync(user.personId)) as PersonRecord | null)
        : null;
      if (person) return person.sharedData?.name;
      return user.displayName;
    },

    operationByImageId: async (auditLogType: AuditLogType) => {
      const user = await Users.findOneUser(auditLogType.operationBy);
      const person = user.personId
        ? ((await People.findOneAsync(user.personId)) as PersonRecord | null)
        : null;
      if (person) return person.sharedData?.imageId;
      return null;
    },
  },
};
