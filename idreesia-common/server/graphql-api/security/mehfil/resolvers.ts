import {
  Mehfils,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const toMehfilDate = (mehfilDate: string | number | Date) => {
  if (mehfilDate instanceof Date) return mehfilDate;
  const asNumber = Number(mehfilDate);
  if (Number.isFinite(asNumber) && String(mehfilDate).trim() !== '') {
    return new Date(asNumber);
  }
  return new Date(mehfilDate);
};

const resolvers: ResolverMap = {
  MehfilType: {
    karkunCount: async mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).countAsync(),
    mehfilKarkuns: async mehfilType =>
      MehfilKarkuns.find({
        mehfilId: { $eq: mehfilType._id },
      }).fetchAsync(),
    mehfilDate: mehfilType => {
      if (!mehfilType.mehfilDate) return null;
      const value =
        mehfilType.mehfilDate instanceof Date
          ? mehfilType.mehfilDate.getTime()
          : Number(mehfilType.mehfilDate);
      return Number.isFinite(value) ? String(value) : String(mehfilType.mehfilDate);
    },
  },

  Query: {
    allMehfils: async () =>
      Mehfils.find({}, { sort: { mehfilDate: -1 } }).fetchAsync(),

    mehfilById: async (obj, { _id }) => Mehfils.findOneAsync(_id),
  },

  Mutation: {
    createMehfil: async (obj, { name, mehfilDate }, { user }) => {
      const date = new Date();
      const mehfilId = await Mehfils.insertAsync({
        name,
        mehfilDate: toMehfilDate(mehfilDate),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Mehfils.findOneAsync(mehfilId);
    },

    updateMehfil: async (obj, { _id, name, mehfilDate }, { user }) => {
      const date = new Date();
      await Mehfils.updateAsync(_id, {
        $set: {
          name,
          ...(mehfilDate != null
            ? { mehfilDate: toMehfilDate(mehfilDate) }
            : {}),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Mehfils.findOneAsync(_id);
    },

    removeMehfil: async (obj, { _id }) => {
      const karkunCount = await MehfilKarkuns.find({
        mehfilId: { $eq: _id },
      }).countAsync();

      if (karkunCount > 0) {
        throw new Error(
          'This Mehfil cannot be deleted since it has karkuns associated with it.'
        );
      }

      return Mehfils.removeAsync(_id);
    },
  },
};

export default resolvers;
