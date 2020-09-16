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
import './17-update-salary-structure';
import './18-create-security-indexes';
import './19-update-users';
import './20-create-account-payment-indexes';
import './21-set-mehfil-duties';
import './22-create-outstation-indexes';
import './23-create-communication-indexes';
import './24-create-security-indexes';
import './25-create-security-indexes';
import './26-create-hr-indexes';
import './27-create-security-indexes';
import './28-create-visitors-against-ms-karkuns';
import './29-create-audit-log-indexes';
import './30-create-imdad-indexes';
import './31-create-updated-at-indexes';
import './32-update-existing-messages';
import './33-change-tr-to-op';
import './34-move-messages-to-operations';
import './35-move-wazaif-to-operations';
import './36-rename-fields-in-visitor';
import './37-create-mehfil-portals';

Migrations.config({
  log: true,
});

Meteor.startup(() => {
  Migrations.migrateTo('latest');
});
