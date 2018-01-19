import { ItemTypes, ItemCategories } from '/imports/lib/collections/inventory';

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
