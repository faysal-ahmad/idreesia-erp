import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";

import "./1-create-admin-user";
import "./2-create-companies";
import "./3-create-indexes";
import "./4-rename-category-to-account-head";
import "./5-merge-item-types-stock-items";

Migrations.config({
  log: true,
});

Meteor.startup(() => {
  Migrations.migrateTo("latest");
});