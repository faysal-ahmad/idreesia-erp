import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Karkuns extends AggregatableCollection {
  constructor(name = 'hr-karkuns', options = {}) {
    const karkuns = super(name, options);

    karkuns.attachSchema(KarkunSchema);
    return karkuns;
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  createKarkun(values, user) {
    const { cnicNumber, contactNumber1, contactNumber2 } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2);

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const karkunId = this.insert(valuesToInsert);
    return this.findOne(karkunId);
  }

  updateKarkun(values, user) {
    const { _id, cnicNumber, contactNumber1, contactNumber2 } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2, _id);

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      updatedAt: date,
      updatedBy: user._id,
    });

    delete valuesToInsert._id;
    this.update(_id, {
      $set: valuesToInsert,
    });

    return this.findOne(_id);
  }

  // **************************************************************
  // Custom Finder Methods
  // **************************************************************
  findByCnicOrContactNumber(cnicNumber, contactNumber) {
    let karkun = null;

    if (cnicNumber) {
      karkun = this.findOne({
        cnicNumber: { $eq: cnicNumber },
      });
    }

    if (karkun) return karkun;

    if (contactNumber) {
      karkun = this.findOne({
        $or: [
          { contactNumber1: contactNumber },
          { contactNumber2: contactNumber },
        ],
      });
    }

    return karkun;
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  isCnicInUse(cnicNumber) {
    const karkun = this.findOne({
      cnicNumber: { $eq: cnicNumber },
    });

    if (karkun) return true;
    return false;
  }

  checkCnicNotInUse(cnicNumber, karkunId) {
    const karkun = this.findOne({
      cnicNumber: { $eq: cnicNumber },
    });

    if (karkun && (!karkunId || karkun._id !== karkunId)) {
      throw new Error(`This CNIC number is already set for ${karkun.name}.`);
    }
  }

  isContactNumberInUse(contactNumber) {
    const karkun = this.findOne({
      $or: [
        { contactNumber1: { $eq: contactNumber } },
        { contactNumber2: { $eq: contactNumber } },
      ],
    });

    if (karkun) return true;
    return false;
  }

  checkContactNotInUse(contactNumber, karkunId) {
    const karkun = this.findOne({
      $or: [
        { contactNumber1: { $eq: contactNumber } },
        { contactNumber2: { $eq: contactNumber } },
      ],
    });

    if (karkun && (!karkunId || karkun._id !== karkunId)) {
      throw new Error(`This contact number is already set for ${karkun.name}.`);
    }
  }
}

export default new Karkuns();
