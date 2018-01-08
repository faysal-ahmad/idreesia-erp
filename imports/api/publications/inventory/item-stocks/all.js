import { ItemStocks } from '/imports/lib/collections/inventory';

export default function all() {
  return ItemStocks.find({});
}
