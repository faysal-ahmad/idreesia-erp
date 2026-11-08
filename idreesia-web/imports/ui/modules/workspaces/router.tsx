import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { ModulePaths } from 'meteor/idreesia-common/constants';
import { default as paths } from './submodule-paths';
import { MembersList } from './members';
import { DiscussionsPage } from './discussions';
import { NightStayReport } from './night-stay-report';
import { MonitoringAlerts } from './monitoring-alerts';
import { MonitoringProfiles } from './monitoring-profiles';
import Landing from './landing';

const Router = () => (
  <Switch>
    <Route path={paths.committeeMembersPath()} component={MembersList} />
    <Route path={paths.committeeDiscussionsPath()} component={DiscussionsPage} />
    <Route
      path={paths.committeeNightStayReportPath()}
      component={NightStayReport}
    />
    <Route
      path={paths.committeeMonitoringAlertsPath()}
      component={MonitoringAlerts}
    />
    <Route
      path={paths.committeeMonitoringProfilesPath()}
      component={MonitoringProfiles}
    />
    <Route path={ModulePaths.workspaces} component={Landing} />
  </Switch>
);

export default Router;
