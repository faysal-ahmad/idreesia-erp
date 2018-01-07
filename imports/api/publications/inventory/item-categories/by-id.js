import { ItemCategories } from '/imports/lib/collections/inventory';

export default function byId({ id }) {
  return ItemCategories.find(id);
}
