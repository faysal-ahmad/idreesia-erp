import { PhysicalStores } from '/imports/lib/collections/inventory';

export default function all() {
  return PhysicalStores.find({});
}
