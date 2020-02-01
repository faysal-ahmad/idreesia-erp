import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { KarkunsNewForm, KarkunsEditForm, KarkunsList } from './karkuns';

const PortalsRouter = () => (
  <Switch>
    <Route path={paths.karkunsNewFormPath()} component={KarkunsNewForm} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath()} component={KarkunsList} />
  </Switch>
);

export default PortalsRouter;
