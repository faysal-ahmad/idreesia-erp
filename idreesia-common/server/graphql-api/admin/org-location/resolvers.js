import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

export default {
  Query: {
    allOrgLocations: async () => OrgLocations.find({}),
    orgLocationById: async (obj, { _id }) => OrgLocations.findOne(_id),
  },

  Mutation: {
    createOrgLocation: async (obj, params, { user }) =>
      OrgLocations.createOrgLocation(params, user),

    updateOrgLocation: async (obj, params, { user }) =>
      OrgLocations.updateOrgLocation(params, user),

    deleteOrgLocation: async (obj, { _id }) =>
      OrgLocations.removeOrgLocation(_id),
  },
};
