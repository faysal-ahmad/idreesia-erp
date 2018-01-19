import { IssuanceForms } from '/imports/lib/collections/inventory';

export default function all({ pageId = 1 }) {
  return IssuanceForms.find({}, {
    skip: 10 * (pageId - 1),
    limit: 10
  });
}
