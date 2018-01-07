import { ItemCategories } from '/imports/lib/collections/inventory';

export default function all() {
  return ItemCategories.find({});
}
