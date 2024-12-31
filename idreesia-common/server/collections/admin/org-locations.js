import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { OrgLocation as OrgLocationSchema } from 'meteor/idreesia-common/server/schemas/admin';

class OrgLocations extends AggregatableCollection {
  constructor(name = 'admin-org-units', options = {}) {
    const orgLocations = super(name, options);
    orgLocations.attachSchema(OrgLocationSchema);
    return orgLocations;
  }

  createOrgLocation({ name, type, parentId }, user) {
    const existingOrgLocation = this.findOne({ name, parentId });
    if (existingOrgLocation) {
      throw new Error(`Org unit name '${name}' is already in use.`);
    }

    const date = new Date();
    const newOrgLocationId = this.insert({
      name,
      type,
      parentId,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    return this.findOne(newOrgLocationId);
  }

  updateOrgLocation({ _id, name, parentId }, user) {
    const existingOrgLocation = this.findOne({ name, parentId });
    if (existingOrgLocation) {
      throw new Error(`Org unit name '${name}' is already in use.`);
    }

    const date = new Date();
    this.update(_id, {
      $set: {
        name,
        parentId,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    return this.findOne(_id);
  }

  removeOrgLocation({ _id }) {
    // Check if there are other org units that have this
    // as their parent
    const childCount = this.find({
      parentId: _id,
    }).count();

    if (childCount > 0) {
      throw new Error(
        `This Org unit is currently in use and cannot be deleted.`
      );
    }

    return this.remove(_id);
  }
}

export default new OrgLocations();
