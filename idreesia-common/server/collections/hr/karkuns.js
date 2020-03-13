import moment from 'moment';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/server/schemas/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';

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
    const { _id } = values;
    const { changedValues, auditValuesCollection } = this.getChangedValues(
      _id,
      values,
      user
    );

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOne(_id);
    }

    const {
      cnicNumber,
      contactNumber1,
      contactNumber2,
      imageId,
    } = changedValues;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2, _id);

    if (imageId) {
      const existingKarkun = this.findOne(_id);
      if (existingKarkun.imageId) {
        Attachments.removeAttachment(existingKarkun.imageId);
      }
    }

    changedValues.updatedAt = new Date();
    changedValues.updatedBy = user._id;
    this.update(_id, {
      $set: changedValues,
      $addToSet: {
        auditLog: auditValuesCollection,
      },
    });

    return this.findOne(_id);
  }

  addAttachment({ _id, attachmentId }, user) {
    const auditValuesCollection = {
      auditValues: [
        {
          fieldName: 'attachmentIds',
          changedFrom: null,
          changedTo: attachmentId,
        },
      ],
      changedOn: new Date(),
      changedBy: user._id,
    };

    const date = new Date();
    this.update(_id, {
      $addToSet: {
        attachmentIds: attachmentId,
        auditLog: auditValuesCollection,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    return this.findOne(_id);
  }

  removeAttachment({ _id, attachmentId }, user) {
    const auditValuesCollection = {
      auditValues: [
        {
          fieldName: 'attachmentIds',
          changedFrom: attachmentId,
          changedTo: null,
        },
      ],
      changedOn: new Date(),
      changedBy: user._id,
    };

    const date = new Date();
    this.update(_id, {
      $pull: {
        attachmentIds: attachmentId,
      },
      $addToSet: {
        auditLog: auditValuesCollection,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    Attachments.removeAttachment(attachmentId);
    return this.findOne(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed. If there are actual changed values,
  // then create an entry for the audit log.
  getChangedValues(_id, newValues, user) {
    const changedValues = {};
    const auditValuesCollection = {
      auditValues: [],
      changedOn: new Date(),
      changedBy: user._id,
    };

    const existingKarkun = this.findOne(_id);
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingKarkun)) {
        changedValues[key] = newValue;
        auditValuesCollection.auditValues.push({
          fieldName: key,
          changedFrom: existingKarkun[key],
          changedTo: this.getNewValueToLog(key, newValue),
        });
      }
    });

    return {
      changedValues,
      auditValuesCollection,
    };
  }

  isValueChanged(key, newValue, existingKarkun) {
    let isChanged;

    switch (key) {
      case 'ehadDate':
      case 'birthDate':
      case 'lastTarteebDate':
      case 'employmentStartDate':
      case 'employmentEndDate':
        isChanged = !moment(existingKarkun[key]).isSame(moment(newValue));
        break;

      default:
        isChanged = existingKarkun[key] !== newValue;
        break;
    }

    return isChanged;
  }

  getNewValueToLog(key, value) {
    let valueToLog;

    switch (key) {
      case 'ehadDate':
      case 'birthDate':
      case 'lastTarteebDate':
      case 'employmentStartDate':
      case 'employmentEndDate':
        valueToLog = new Date(value);
        break;

      default:
        valueToLog = value;
        break;
    }

    return valueToLog;
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
