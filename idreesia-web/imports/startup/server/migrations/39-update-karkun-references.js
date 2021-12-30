import { Migrations } from 'meteor/percolate:migrations';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  KarkunDuties,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 39,
  up() {
    // Update the karkunId field in Users and also rename to personId
    const users = Users.find({}).fetch();
    users.forEach(user => {
      const karkunId = user.karkunId;
      if (karkunId) {
        const person = People.findOne({ 'karkunData.karkunId': karkunId });
        if (person) {
          Users.update(user._id, {
            $set: {
              personId: person._id,
            },
          });
        }
      }
    });

    // Utility function to update the karkunId references in other collections
    const convertCollection = collection => {
      const records = collection.find({}).fetch();
      records.forEach(record => {
        const karkunId = record.karkunId;
        const person = People.findOne({ 'karkunData.karkunId': karkunId });
        if (person) {
          collection.update(record._id, {
            $set: {
              karkunId: person._id,
            },
          });
        }
      });
    };

    convertCollection(Attendances);
    convertCollection(KarkunDuties);
    convertCollection(Salaries);
    convertCollection(MehfilKarkuns);

    // Update references in the IssuanceForms collection
    const issuanceForms = IssuanceForms.find({}).fetch();
    issuanceForms.forEach(issuanceForm => {
      const { issuedBy, issuedTo } = issuanceForm;
      if (issuedBy) {
        const person = People.findOne({ 'karkunData.karkunId': issuedBy });
        if (person) {
          IssuanceForms.update(issuanceForm._id, {
            $set: {
              issuedBy: person._id,
            },
          });
        }
      }
      if (issuedTo) {
        const person = People.findOne({ 'karkunData.karkunId': issuedTo });
        if (person) {
          IssuanceForms.update(issuanceForm._id, {
            $set: {
              issuedTo: person._id,
            },
          });
        }
      }
    });

    // Update references in the PurchaseForms collection
    const purchaseForms = PurchaseForms.find({}).fetch();
    purchaseForms.forEach(purchaseForm => {
      const { receivedBy, purchasedBy } = purchaseForm;
      if (receivedBy) {
        const person = People.findOne({ 'karkunData.karkunId': receivedBy });
        if (person) {
          PurchaseForms.update(purchaseForm._id, {
            $set: {
              receivedBy: person._id,
            },
          });
        }
      }
      if (purchasedBy) {
        const person = People.findOne({ 'karkunData.karkunId': purchasedBy });
        if (person) {
          PurchaseForms.update(purchaseForm._id, {
            $set: {
              purchasedBy: person._id,
            },
          });
        }
      }
    });

    // Update references in the StockAdjustments collection
    const stockAdjustments = StockAdjustments.find({}).fetch();
    stockAdjustments.forEach(stockAdjustment => {
      const { adjustedBy } = stockAdjustment;
      if (adjustedBy) {
        const person = People.findOne({ 'karkunData.karkunId': adjustedBy });
        if (person) {
          StockAdjustments.update(stockAdjustment._id, {
            $set: {
              adjustedBy: person._id,
            },
          });
        }
      }
    });
  },
});
