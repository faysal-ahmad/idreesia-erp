import moment from 'moment';

import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/server/schemas/hr';
import {
  AuditLogs,
  Attachments,
} from 'meteor/idreesia-common/server/collections/common';
import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import { forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

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
    AuditLogs.createAuditLog({
      entityId: karkunId,
      entityType: EntityType.KARKUN,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    // Check subscription staus of contact numbers
    const params = { karkunId };
    const options = { priority: 'normal', retry: 10 };
    createJob({
      type: JobTypes.CHECK_SUBSCRIPTION_STATUS_NOW,
      params,
      options,
    });

    return this.findOne(karkunId);
  }

  updateKarkun(values, user) {
    const { _id } = values;
    const existingKarkun = this.findOne(_id);
    const changedValues = this.getChangedValues(_id, values, existingKarkun);

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
    if (contactNumber1 || contactNumber2) {
      // Check subscription staus of contact numbers
      const params = { karkunId: _id };
      const options = { priority: 'normal', retry: 10 };
      createJob({
        type: JobTypes.CHECK_SUBSCRIPTION_STATUS_NOW,
        params,
        options,
      });
    }

    if (imageId) {
      if (existingKarkun.imageId) {
        Attachments.removeAttachment(existingKarkun.imageId);
      }
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    this.update(_id, { $set: valuesToUpdate });

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.KARKUN,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingKarkun
    );

    return this.findOne(_id);
  }

  addAttachment({ _id, attachmentId }, user) {
    const date = new Date();
    this.update(_id, {
      $addToSet: {
        attachmentIds: attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.KARKUN,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: { attachmentId },
    });

    return this.findOne(_id);
  }

  removeAttachment({ _id, attachmentId }, user) {
    const date = new Date();
    this.update(_id, {
      $pull: {
        attachmentIds: attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    Attachments.removeAttachment(attachmentId);

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.KARKUN,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: { attachmentId: null },
      },
      {
        attachmentId,
      }
    );

    return this.findOne(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(_id, newValues, existingKarkun) {
    const changedValues = {};
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingKarkun)) {
        changedValues[key] = newValue;
      }
    });

    return changedValues;
  }

  isValueChanged(key, newValue, existingKarkun) {
    if (!existingKarkun[key] && !newValue) return false;
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
