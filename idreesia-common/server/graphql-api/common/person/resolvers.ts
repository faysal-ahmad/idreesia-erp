import type DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';
import { compact } from 'meteor/idreesia-common/utilities/lodash';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';

type Loader = DataLoader<string, unknown>;

interface Loaders {
  common: {
    attachments: Loader;
    people: Loader;
  };
  hr: {
    jobs: Loader;
    jobShifts: Loader;
    karkunTeams: DataLoader<string, unknown[]>;
  };
  admin: {
    orgLocations: Loader;
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
  cityLocationId?: string;
  mehfilLocationId?: string;
  attachmentIds?: string[];
}

interface PersonEmployeeDataType {
  jobId?: string;
  jobShiftId?: string;
  reportsToPersonId?: string;
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
    cityLocation: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.cityLocationId) return null;
      return loaders.admin.orgLocations.load(personKarkunDataType.cityLocationId);
    },
    mehfilLocation: async (
      personKarkunDataType: PersonKarkunDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personKarkunDataType.mehfilLocationId) return null;
      return loaders.admin.orgLocations.load(
        personKarkunDataType.mehfilLocationId
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
    jobShift: async (
      personEmployeeDataType: PersonEmployeeDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personEmployeeDataType.jobShiftId) return null;
      return loaders.hr.jobShifts.load(personEmployeeDataType.jobShiftId);
    },
    reportsTo: async (
      personEmployeeDataType: PersonEmployeeDataType,
      _args: unknown,
      { loaders }: ResolverContext
    ) => {
      if (!personEmployeeDataType.reportsToPersonId) return null;
      return loaders.common.people.load(personEmployeeDataType.reportsToPersonId);
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
