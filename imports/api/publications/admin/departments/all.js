import { Departments } from '/imports/lib/collections/admin';

export default function all() {
  return Departments.find({});
}
