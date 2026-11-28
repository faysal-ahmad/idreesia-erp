import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/quave:migrations';

import './1-seed-users';
import './2-create-admin-indexes';
import './3-create-organization';
import './4-create-people-hr-indexes';
import './5-create-security';
import './6-create-stores-indexes';
import './7-create-purchasing-indexes';
import './8-create-workspaces-indexes';
import './9-create-employment-history';
import './10-create-leaves';

Migrations.config({
  log: true,
});

Meteor.startup(async () => {
  await Migrations.migrateTo('latest');
});
