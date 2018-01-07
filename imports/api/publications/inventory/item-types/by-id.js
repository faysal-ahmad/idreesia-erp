import { ItemTypes } from '/imports/lib/collections/inventory';

export default function byId({ id }) {
  return ItemTypes.find(id);
}
