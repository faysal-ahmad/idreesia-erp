import { Profiles } from '/imports/lib/collections/admin';
import { ItemTypes, ItemCategories, ItemStocks } from '/imports/lib/collections/inventory';

export function getItemTypeName(itemTypeId) {
  let retVal = null;
  const itemType = ItemTypes.findOne(itemTypeId);
  if (itemType) {
    retVal = itemType.name;
  }

  return retVal;
}

export function getItemCategoryName(itemTypeId) {
  let retVal = null;
  const itemType = ItemTypes.findOne(itemTypeId);
  if (itemType) {
    const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
    if (itemCategory) retVal = itemCategory.name;
  }

  return retVal;
}

export function getItemDisplayNameFromItemStockId(itemStockId) {
  let retVal = null;

  const itemStock = ItemStocks.findOne(itemStockId);
  if (!itemStock) return retVal;

  const itemType = ItemTypes.findOne(itemStock.itemTypeId);
  if (!itemType) return retVal;

  retVal = itemType.name;
  return retVal;
}

export function getNameFromProfileId(profileId) {
  let retVal = null;
  const profile = Profiles.findOne(profileId);
  if (profile) {
    retVal = profile.name;
  }

  return retVal;
}
