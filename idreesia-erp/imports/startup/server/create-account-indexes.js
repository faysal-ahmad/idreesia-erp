import { Categories } from "meteor/idreesia-common/collections/accounts";

Categories.rawCollection().createIndex(
  { number: 1 },
  { background: true, unique: true }
);
Categories.rawCollection().createIndex({ parent: 1 }, { background: true });
Categories.rawCollection().createIndex({ companyId: 1 }, { background: true });
