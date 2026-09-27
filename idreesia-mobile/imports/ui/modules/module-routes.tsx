import React from 'react';

import { Route } from '../router';
import { FeatureGate } from './feature-gate';
import { ModuleScreen } from './module-screen';
import { modules } from './registry';

/**
 * Routes for every module and feature, to spread into the signed-in <Switch>
 * (react-router's Switch only sees direct children, so this returns an array
 * rather than a component).
 */
export const renderModuleRoutes = () =>
  modules.flatMap(module => [
    <Route key={module.path} exact path={module.path}>
      <ModuleScreen module={module} />
    </Route>,
    ...module.features.map(feature => (
      <Route key={feature.path} path={feature.path}>
        <FeatureGate feature={feature} module={module} />
      </Route>
    )),
  ]);
