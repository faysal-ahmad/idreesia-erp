import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  getPersonImageUrls,
  type PersonImageFields,
} from 'meteor/idreesia-common/server/business-logic/common/person-images';

interface AuditLogType {
  operationBy: string;
}

interface PersonRecord {
  sharedData?: PersonImageFields & {
    name?: string;
  };
}

async function getOperationByPerson(auditLogType: AuditLogType) {
  const user = await Users.findOneUser(auditLogType.operationBy);
  const person = user.personId
    ? ((await People.findOneAsync(user.personId)) as PersonRecord | null)
    : null;
  return { user, person };
}

export default {
  AuditLogType: {
    operationByName: async (auditLogType: AuditLogType) => {
      const { user, person } = await getOperationByPerson(auditLogType);
      if (person) return person.sharedData?.name;
      return user.displayName;
    },

    operationByImageUrl: async (auditLogType: AuditLogType) => {
      const { person } = await getOperationByPerson(auditLogType);
      return getPersonImageUrls(person?.sharedData).imageUrl;
    },

    operationByImageThumbnailUrl: async (auditLogType: AuditLogType) => {
      const { person } = await getOperationByPerson(auditLogType);
      return getPersonImageUrls(person?.sharedData).imageThumbnailUrl;
    },
  },
};
