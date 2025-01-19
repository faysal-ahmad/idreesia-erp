import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

export default {
  Query: {
    allOrgLocations: async () => OrgLocations.find({}),
    orgLocationById: async (obj, { _id }) => OrgLocations.findOne(_id),
  },

  Mutation: {
    createOrgLocation: async (obj, { name, type, parentId }, { user }) => {
      const parentLocation = OrgLocations.findOne(parentId);
      const date = new Date();
      const newOrgLocationId = OrgLocations.insert({
        name,
        type,
        parentId,
        allParentIds: parentLocation.allParentIds.concat(parentId),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return OrgLocations.findOne(newOrgLocationId);
    },

    updateOrgLocation: async (obj, { _id, name, mehfilDetails }, { user }) => {
      const date = new Date();
      OrgLocations.update(_id, {
        $set: {
          name,
          mehfilDetails,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return OrgLocations.findOne(_id);
    },

    updateOrgLocationParent: async (obj, { _id, parentId }, { user }) => {},

    deleteOrgLocation: async (obj, { _id }) => {
      // Check if there are other org units that have this
      // as their parent
      const childCount = OrgLocations.find({
        parentId: _id,
      }).count();

      if (childCount > 0) {
        throw new Error(
          `This Org location is currently in use and cannot be deleted.`
        );
      }

      return OrgLocations.remove(_id);
    },
  },
};
