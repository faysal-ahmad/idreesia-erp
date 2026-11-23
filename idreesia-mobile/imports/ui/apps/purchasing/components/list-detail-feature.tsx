import React, { type ComponentType } from 'react';

import { KeepAlive } from '../../../layout';
import { matchPath, Redirect, Route, Switch, useLocation } from '../../../router';

interface Props {
  /** The feature's route; its list screen is at this exact path. */
  basePath: string;
  list: ComponentType;
  /** Screens under the feature, in match order (`/new` before `/:id`). */
  routes: Array<{ path: string; component: ComponentType }>;
}

/**
 * A feature that is a list with screens opened from it. The list stays
 * mounted under them (KeepAlive), so going back shows the same search,
 * filters, loaded pages and scroll position.
 */
export const ListDetailFeature = ({ basePath, list: List, routes }: Props) => {
  const { pathname } = useLocation();
  const onList = Boolean(matchPath(pathname, { path: basePath, exact: true }));

  return (
    <>
      <KeepAlive active={onList}>
        <List />
      </KeepAlive>
      <Switch>
        <Route exact path={basePath} render={() => null} />
        {routes.map(route => (
          <Route key={route.path} exact component={route.component} path={route.path} />
        ))}
        <Redirect to={basePath} />
      </Switch>
    </>
  );
};
