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
  async up() {
    // Update the karkunId field in Users and also rename to personId
    const users = await Users.find({}).fetchAsync();
    for (const user of users) {
      const karkunId = user.karkunId;
      if (karkunId) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': karkunId });
        if (person) {
          await Users.updateAsync(user._id, {
            $set: {
              personId: person._id,
            },
          });
        }
      }
    }

    // Utility function to update the karkunId references in other collections
    const convertCollection = async (collection: { find(selector?: unknown): { fetchAsync(): Promise<Array<Record<string, any>>> }; updateAsync(selector: unknown, modifier: unknown): Promise<number> }) => {
      const records = await collection.find({}).fetchAsync();
      for (const record of records) {
        const karkunId = record.karkunId;
        const person = await People.findOneAsync({ 'karkunData.karkunId': karkunId });
        if (person) {
          await collection.updateAsync(record._id, {
            $set: {
              karkunId: person._id,
            },
          });
        }
      }
    };

    await convertCollection(Attendances);
    await convertCollection(KarkunDuties);
    await convertCollection(Salaries);
    await convertCollection(MehfilKarkuns);

    // Update references in the IssuanceForms collection
    const issuanceForms = await IssuanceForms.find({}).fetchAsync();
    for (const issuanceForm of issuanceForms) {
      const { issuedBy, issuedTo } = issuanceForm;
      if (issuedBy) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': issuedBy });
        if (person) {
          await IssuanceForms.updateAsync(issuanceForm._id, {
            $set: {
              issuedBy: person._id,
            },
          });
        }
      }
      if (issuedTo) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': issuedTo });
        if (person) {
          await IssuanceForms.updateAsync(issuanceForm._id, {
            $set: {
              issuedTo: person._id,
            },
          });
        }
      }
    }

    // Update references in the PurchaseForms collection
    const purchaseForms = await PurchaseForms.find({}).fetchAsync();
    for (const purchaseForm of purchaseForms) {
      const { receivedBy, purchasedBy } = purchaseForm;
      if (receivedBy) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': receivedBy });
        if (person) {
          await PurchaseForms.updateAsync(purchaseForm._id, {
            $set: {
              receivedBy: person._id,
            },
          });
        }
      }
      if (purchasedBy) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': purchasedBy });
        if (person) {
          await PurchaseForms.updateAsync(purchaseForm._id, {
            $set: {
              purchasedBy: person._id,
            },
          });
        }
      }
    }

    // Update references in the StockAdjustments collection
    const stockAdjustments = await StockAdjustments.find({}).fetchAsync();
    for (const stockAdjustment of stockAdjustments) {
      const { adjustedBy } = stockAdjustment;
      if (adjustedBy) {
        const person = await People.findOneAsync({ 'karkunData.karkunId': adjustedBy });
        if (person) {
          await StockAdjustments.updateAsync(stockAdjustment._id, {
            $set: {
              adjustedBy: person._id,
            },
          });
        }
      }
    }
  },
});
