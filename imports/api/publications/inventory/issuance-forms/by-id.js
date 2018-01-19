import { IssuanceForms } from '/imports/lib/collections/inventory';

export default function byId({ id }) {
  return IssuanceForms.find(id);
}
