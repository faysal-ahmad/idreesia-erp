import { Profiles } from '/imports/lib/collections/admin';

export default function all() {
  return Profiles.find({});
}
