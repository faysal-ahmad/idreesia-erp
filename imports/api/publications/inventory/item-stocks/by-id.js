import { ItemStocks } from '/imports/lib/collections/inventory';

export default function byId({ id }) {
  return ItemStocks.find(id);
}
