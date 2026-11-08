import React, { useEffect, useState } from 'react';

import { KeepAlive } from '../../../layout';
import { matchPath, Redirect, Route, Switch, useLocation } from '../../../router';
import { SecurityPaths } from '../paths';
import { PhotoSearchScreen } from './photo-search-screen';
import { VisitorDetailScreen } from './visitor-detail-screen';
import { VisitorsListScreen } from './visitors-list-screen';

const isAt = (pathname: string, path: string) => Boolean(matchPath(pathname, { path, exact: true }));

/**
 * Security → Visitors. Owns every route under SecurityPaths.visitors.
 *
 * The list and the photo search stay mounted under a visitor's detail screen
 * (KeepAlive), so going back shows them as they were rather than losing the
 * search, the loaded pages or the photo.
 */
export const VisitorsFeature = () => {
  const { pathname } = useLocation();
  const onList = isAt(pathname, SecurityPaths.visitors);
  const onPhotoSearch = isAt(pathname, SecurityPaths.visitorsPhotoSearch);
  const onDetail = !onList && !onPhotoSearch && isAt(pathname, SecurityPaths.visitorDetailPattern);

  // The photo search is in the back stack while it's on show and while a
  // detail screen opened from it is. Going back to the list drops it.
  const [photoSearchInStack, setPhotoSearchInStack] = useState(onPhotoSearch);
  useEffect(() => {
    if (onPhotoSearch) setPhotoSearchInStack(true);
    else if (!onDetail) setPhotoSearchInStack(false);
  }, [onPhotoSearch, onDetail]);

  return (
    <>
      <KeepAlive active={onList}>
        <VisitorsListScreen />
      </KeepAlive>
      {(onPhotoSearch || (onDetail && photoSearchInStack)) && (
        <KeepAlive active={onPhotoSearch}>
          <PhotoSearchScreen />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={[SecurityPaths.visitors, SecurityPaths.visitorsPhotoSearch]} render={() => null} />
        <Route exact component={VisitorDetailScreen} path={SecurityPaths.visitorDetailPattern} />
        <Redirect to={SecurityPaths.visitors} />
      </Switch>
    </>
  );
};
