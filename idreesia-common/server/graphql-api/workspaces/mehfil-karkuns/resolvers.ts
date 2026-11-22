import {
  listMehfilKarkuns,
  listMyMehfilKarkunsLocations,
} from 'meteor/idreesia-common/server/business-logic/mehfil-karkuns';

interface Context {
  user: { _id: string; locked?: boolean; isSuperAdmin?: boolean };
}

// Who may call each field is declared in the schema with
// @checkMehfilKarkunsAccess.
export default {
  Query: {
    myMehfilKarkunsLocations: async (
      _obj: unknown,
      _args: unknown,
      { user }: Context
    ) => listMyMehfilKarkunsLocations(user),

    pagedMehfilKarkuns: async (
      _obj: unknown,
      params: {
        locationId: string;
        name?: string | null;
        pageIndex?: string | null;
        pageSize?: string | null;
      }
    ) => listMehfilKarkuns(params),
  },
};
