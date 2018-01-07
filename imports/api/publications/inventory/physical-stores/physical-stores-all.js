import { PhysicalStores } from '/imports/lib/collections/inventory';

export default function physicalStoresAll() {
  return PhysicalStores.find({});
}
