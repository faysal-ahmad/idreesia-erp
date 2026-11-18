import type DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';
import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';

type Loader = DataLoader<string, unknown>;

interface Loaders {
  common: {
    attachments: Loader;
  };
  hr: {
    jobs: Loader;
    karkunTeams: DataLoader<string, unknown[]>;
  };
  outstation: {
    cities: Loader;
    cityMehfils: Loader;
  };
}

interface Person {
  _id: string;
  karkunData?: PersonKarkunDataType | null;
}

interface PersonSharedDataType {
  imageKey?: string;
  imageThumbnailKey?: string;
  tagIds?: string[];
}

interface PersonKarkunDataType {
  _id?: string;
  cityId?: string;
  cityMehfilId?: string;
  attachmentIds?: string[];
}

interface PersonEmployeeDataType {
  jobId?: string;
}

interface ResolverContext {
  loaders: Loaders;
  user: {
    _id: string;
    username?: string;
    locked?: boolean;
    permissions?: string[];
  };
}

interface PeopleRawCollection {
  distinct(fieldName: string): Promise<unknown[]>;
}

export default {
  PersonType: {
    karkunData: (person: Person) =>
      person.karkunData ? { ...person.karkunData, _id: person._id } : null,
  },
  PersonSharedDataType: {
    imageUrl: (personSharedDataType: PersonSharedDataType) =>
      getPersonImageUrls(personSharedDataType).imageUrl,
    imageThumbnailUrl: (personSharedDataType: PersonSharedDataType) =>
      getPersonImageUrls(personSharedDataType).imageThumbnailUrl,
    tags: async (personSharedDataType: PersonSharedDataType) => {
      const { tagIds } = personSharedDataType;
      if (tagIds && tagIds.length > 0) {
        return PeopleTags.find({ _id: { $in: tagIds } }).fetchAsync();
      }

      return [];
    },
  },
  PersonBasicSharedDataType: {
    imageUrl: (personSharedDataType: PersonSharedDataType) =>
      getPersonImageUrls(personSharedDataType).imageUrl,
    imageThumbnailUrl: (personSharedDataType: PersonSharedDataType) =>
      getPersonImageUrls(personSharedDataType).imageThumbnailUrl,
  },
  PersonKarkunDataType: {
    city: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.cityId) return null;
      return loaders.outstation.cities.load(personKarkunDataType.cityId);
    },
    cityMehfil: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.cityMehfilId) return null;
      return loaders.outstation.cityMehfils.load(
        personKarkunDataType.cityMehfilId
      );
    },
    teams: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType._id) return [];
      return loaders.hr.karkunTeams.load(personKarkunDataType._id);
    },
    attachments: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      const { attachmentIds } = personKarkunDataType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Promise.all(
          attachmentIds.map(attachmentId =>
            loaders.common.attachments.load(attachmentId)
          )
        );
      }

      return [];
    },
  },
  PersonEmployeeDataType: {
    job: async (
      personEmployeeDataType: PersonEmployeeDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personEmployeeDataType.jobId) return null;
      return loaders.hr.jobs.load(personEmployeeDataType.jobId);
    },
  },

  Query: {
    distinctCities: async () => {
      const cities = await (
        People.rawCollection() as unknown as PeopleRawCollection
      ).distinct('visitorData.city');
      return compact(cities);
    },

    distinctCountries: async () => {
      const countries = await (
        People.rawCollection() as unknown as PeopleRawCollection
      ).distinct(
        'visitorData.country'
      );
      return compact(countries);
    },
  },
};
