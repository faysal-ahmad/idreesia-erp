import React, { useEffect, useState } from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { DiscussionProvider } from './discussion-context';
import { DiscussionsScreen } from './discussions-screen';
import { SavedMessagesScreen } from './saved-messages-screen';
import { SearchScreen } from './search-screen';
import { ThreadScreen } from './thread-screen';

const isAt = (pathname: string, path: string) => Boolean(matchPath(pathname, { path, exact: true }));

/**
 * A committee's discussion and the screens opened from it: a thread, search,
 * pinned and starred messages. They share one discussion store (and its
 * polling) through DiscussionProvider.
 *
 * The main list stays mounted under them (KeepAlive), so going back shows it
 * as it was. So does search while a thread opened from it is on top.
 */
export const DiscussionFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const main = WorkspacesPaths.committeeDiscussions(committeeId);
  const search = WorkspacesPaths.committeeDiscussionSearch(committeeId);
  const onMain = isAt(pathname, main);
  const onSearch = isAt(pathname, search);
  const onThread = isAt(pathname, WorkspacesPaths.committeeDiscussionThreadPattern);

  // Search is in the back stack while on show and while a thread opened from
  // it is; going back to the main list drops it.
  const [searchInStack, setSearchInStack] = useState(onSearch);
  useEffect(() => {
    if (onSearch) setSearchInStack(true);
    else if (!onThread) setSearchInStack(false);
  }, [onSearch, onThread]);

  return (
    <DiscussionProvider committeeId={committeeId}>
      <KeepAlive active={onMain}>
        <DiscussionsScreen active={onMain} />
      </KeepAlive>
      {(onSearch || (onThread && searchInStack)) && (
        <KeepAlive active={onSearch}>
          <SearchScreen />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={[WorkspacesPaths.committeeDiscussionsPattern, WorkspacesPaths.committeeDiscussionSearchPattern]} render={() => null} />
        <Route exact component={ThreadScreen} path={WorkspacesPaths.committeeDiscussionThreadPattern} />
        <Route exact path={WorkspacesPaths.committeeDiscussionPinnedPattern} render={() => <SavedMessagesScreen kind="pinned" />} />
        <Route exact path={WorkspacesPaths.committeeDiscussionStarredPattern} render={() => <SavedMessagesScreen kind="starred" />} />
        <Redirect to={main} />
      </Switch>
    </DiscussionProvider>
  );
};
