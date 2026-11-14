import { discussionsModule } from 'meteor/idreesia-common/server/business-logic/discussions';
import { dmsModule } from 'meteor/idreesia-common/server/business-logic/dms';
import { meetingsModule } from 'meteor/idreesia-common/server/business-logic/meetings';
import { pollsModule } from 'meteor/idreesia-common/server/business-logic/polls';
import { projectsModule } from 'meteor/idreesia-common/server/business-logic/projects';

import { registerHeadlessModule } from './registry';

// Every headless module registers here, so the notifications aggregator
// can reach it.
registerHeadlessModule(discussionsModule);
registerHeadlessModule(dmsModule);
registerHeadlessModule(meetingsModule);
registerHeadlessModule(pollsModule);
registerHeadlessModule(projectsModule);
