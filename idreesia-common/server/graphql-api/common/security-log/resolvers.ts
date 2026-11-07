import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  getPersonImageUrls,
  type PersonImageFields,
} from 'meteor/idreesia-common/server/business-logic/common/person-images';

interface SecurityLogType {
  userId?: string;
  operationBy: string;
}

interface PersonRecord {
  sharedData?: PersonImageFields & {
    name?: string;
  };
}

async function getUserPerson(userId: string | undefined) {
  if (!userId) return { user: null, person: null };
  const user = await Users.findOneUser(userId);
  const person = user.personId
    ? ((await People.findOneAsync(user.personId)) as PersonRecord | null)
    : null;
  return { user, person };
}

export default {
  SecurityLogType: {
    userName: async (securityLogType: SecurityLogType) => {
      const { user, person } = await getUserPerson(securityLogType.userId);
      if (person) return person.sharedData?.name;
      return user?.displayName;
    },

    userImageUrl: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.userId);
      return getPersonImageUrls(person?.sharedData).imageUrl;
    },

    userImageThumbnailUrl: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.userId);
      return getPersonImageUrls(person?.sharedData).imageThumbnailUrl;
    },

    operationByName: async (securityLogType: SecurityLogType) => {
      const { user, person } = await getUserPerson(securityLogType.operationBy);
      if (person) return person.sharedData?.name;
      return user?.displayName;
    },

    operationByImageUrl: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.operationBy);
      return getPersonImageUrls(person?.sharedData).imageUrl;
    },

    operationByImageThumbnailUrl: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.operationBy);
      return getPersonImageUrls(person?.sharedData).imageThumbnailUrl;
    },
  },
};
