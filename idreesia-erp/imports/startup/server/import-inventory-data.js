import { Meteor } from "meteor/meteor";
import { ItemTypes, ItemCategories } from "meteor/idreesia-common/collections/inventory";
import { Accounts } from "meteor/accounts-base";

import { default as csv } from "csvtojson";

const adminUser = Accounts.findUserByUsername("erp-admin");
const fileName = "data/store-inventory-records.csv";
const csvData = Assets.getText(fileName);

const jsonArray = [];
csv()
  .fromString(csvData)
  .subscribe(jsonObj => jsonArray.push(jsonObj))
  .on(
    "done",
    Meteor.bindEnvironment(() => {
      jsonArray.forEach(
        ({ Id, UrduName, EnglishName, Company, Details, UOM, Category }) => {
          let itemCategoryId;
          const categoryName = Category.trim();
          const existingCategory = ItemCategories.findOne({
            name: categoryName,
          });
          if (!existingCategory) {
            const date = new Date();
            itemCategoryId = ItemCategories.insert({
              name: categoryName,
              createdAt: date,
              createdBy: adminUser._id,
              updatedAt: date,
              updatedBy: adminUser._id,
            });
          } else {
            itemCategoryId = existingCategory._id;
          }

          const existingItemType = ItemTypes.findOne({
            externalReferenceId: Id,
          });
          if (!existingItemType) {
            const date = new Date();
            ItemTypes.insert({
              externalReferenceId: Id,
              name: EnglishName,
              urduName: UrduName,
              company: Company,
              details: Details,
              unitOfMeasurement: UOM,
              itemCategoryId,
              createdAt: date,
              createdBy: adminUser._id,
              updatedAt: date,
              updatedBy: adminUser._id,
            });
          }
        }
      );
    })
  );
