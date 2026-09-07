import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

interface SecurityLogType {
  userId?: string;
  operationBy: string;
}

interface PersonRecord {
  sharedData?: {
    name?: string;
    imageId?: string;
    imageThumbnailId?: string;
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

    userImageId: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.userId);
      if (person) return person.sharedData?.imageId;
      return null;
    },

    userImageThumbnailId: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.userId);
      if (person) return person.sharedData?.imageThumbnailId;
      return null;
    },

    operationByName: async (securityLogType: SecurityLogType) => {
      const { user, person } = await getUserPerson(securityLogType.operationBy);
      if (person) return person.sharedData?.name;
      return user?.displayName;
    },

    operationByImageId: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.operationBy);
      if (person) return person.sharedData?.imageId;
      return null;
    },

    operationByImageThumbnailId: async (securityLogType: SecurityLogType) => {
      const { person } = await getUserPerson(securityLogType.operationBy);
      if (person) return person.sharedData?.imageThumbnailId;
      return null;
    },
  },
};
