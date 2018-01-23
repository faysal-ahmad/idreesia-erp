import { Profiles } from '/imports/lib/collections/admin';

export default function byId({ id }) {
  return Profiles.find(id);
}
