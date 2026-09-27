import React from 'react';

import { Redirect, Route, Switch } from '../../../router';
import { SecurityPaths } from '../paths';
import { PhotoSearchScreen } from './photo-search-screen';
import { VisitorsListScreen } from './visitors-list-screen';

/** Security → Visitors. Owns every route under SecurityPaths.visitors. */
export const VisitorsFeature = () => (
  <Switch>
    <Route exact component={VisitorsListScreen} path={SecurityPaths.visitors} />
    <Route exact component={PhotoSearchScreen} path={SecurityPaths.visitorsPhotoSearch} />
    <Redirect to={SecurityPaths.visitors} />
  </Switch>
);
