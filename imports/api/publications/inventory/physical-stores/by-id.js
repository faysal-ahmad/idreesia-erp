import { PhysicalStores } from '/imports/lib/collections/inventory';

export default function byId({ id }) {
  return PhysicalStores.find(id);
}
