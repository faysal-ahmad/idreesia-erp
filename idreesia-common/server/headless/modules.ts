import { discussionsModule } from 'meteor/idreesia-common/server/business-logic/discussions';
import { dmsModule } from 'meteor/idreesia-common/server/business-logic/dms';

import { registerHeadlessModule } from './registry';

// Every headless module registers here, so the notifications aggregator
// can reach it.
registerHeadlessModule(discussionsModule);
registerHeadlessModule(dmsModule);
