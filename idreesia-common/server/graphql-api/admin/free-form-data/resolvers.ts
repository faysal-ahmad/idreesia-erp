import {
  pagedFreeFormValues,
  renameVisitorCity,
  renameVisitorCountry,
} from 'meteor/idreesia-common/server/business-logic/common/people';
import {
  pagedFreeFormCities,
  updateCityLocationMappings,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface UserRef {
  _id: string;
}

interface RenameArgs {
  existingSpelling: string;
  newSpelling: string;
}

interface PageArgs {
  pageIndex: number;
  pageSize: number;
}

export default {
  Query: {
    pagedFreeFormCountries: async (
      _obj: unknown,
      { pageIndex, pageSize }: PageArgs
    ) => pagedFreeFormValues('country', pageIndex, pageSize),
    pagedFreeFormCities: async (
      _obj: unknown,
      { pageIndex, pageSize }: PageArgs
    ) => pagedFreeFormCities(pageIndex, pageSize),
  },
  Mutation: {
    renameFreeFormCity: async (
      _obj: unknown,
      { existingSpelling, newSpelling }: RenameArgs,
      { user }: { user: UserRef }
    ) => renameVisitorCity(existingSpelling, newSpelling, user),
    renameFreeFormCountry: async (
      _obj: unknown,
      { existingSpelling, newSpelling }: RenameArgs,
      { user }: { user: UserRef }
    ) => renameVisitorCountry(existingSpelling, newSpelling, user),
    updateCityLocationMappings: async (
      _obj: unknown,
      _args: unknown,
      { user }: { user: UserRef }
    ) => updateCityLocationMappings(user),
  },
};
