import { PhysicalStores } from '/imports/lib/collections/inventory';

export default function physicalStoresById({ id }) {
  return PhysicalStores.find(id);
}
