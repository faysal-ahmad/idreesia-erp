import { ItemTypes } from '/imports/lib/collections/inventory';

export default function all() {
  return ItemTypes.find({});
}
