import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import './1-create-admin-user';
import './2-create-companies';
import './3-create-indexes';
import './4-rename-category-to-account-head';
import './5-merge-item-types-stock-items';
import './6-move-categories-into-store';
import './7-move-locations-into-store';
import './8-create-account-indexes';
import './9-create-hr-indexes';
import './10-create-security-indexes';
import './11-split-account-voucher-number';
import './12-create-guest-user';
import './13-create-hr-indexes';
import './14-restructure-hr-data';
import './15-create-hr-indexes';
import './16-create-security-indexes';

Migrations.config({
  log: true,
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
