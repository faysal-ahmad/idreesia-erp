import React from 'react';

import { Redirect, Route, Switch } from '../../../router';
import { PurchasingPaths } from '../paths';
import { DashboardScreen } from './dashboard-screen';

/** Purchasing → Dashboard. A single screen. */
export const DashboardFeature = () => (
  <Switch>
    <Route exact component={DashboardScreen} path={PurchasingPaths.dashboard} />
    <Redirect to={PurchasingPaths.dashboard} />
  </Switch>
);
