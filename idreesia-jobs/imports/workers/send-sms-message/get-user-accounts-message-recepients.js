import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

export default function getUserAccountsMessageRecepients(recepientFilter) {
  const users = Users.find({ _id: { $in: recepientFilter.userIds } });
  const karkunIds = users.map(user => user.karkunId);
  const karkuns = Karkuns.find({ _id: { $in: karkunIds } });

  return {
    karkuns,
    visitors: [],
  };
}
