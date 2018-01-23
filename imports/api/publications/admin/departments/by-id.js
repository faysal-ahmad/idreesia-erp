import { Departments } from '/imports/lib/collections/admin';

export default function byId({ id }) {
  return Departments.find(id);
}
