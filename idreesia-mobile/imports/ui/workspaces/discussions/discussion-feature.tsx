import React, { useEffect, useState } from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { DiscussionProvider } from './discussion-context';
import { type DiscussionScope, useCommitteeDiscussionScope } from './discussion-scope';
import { DiscussionsScreen } from './discussions-screen';
import { SavedMessagesScreen } from './saved-messages-screen';
import { SearchScreen } from './search-screen';
import { ThreadScreen } from './thread-screen';

const isAt = (pathname: string, path: string) => Boolean(matchPath(pathname, { path, exact: true }));

interface RoutesProps {
  scope: DiscussionScope;
  /** Overrides the screen title (a project chat is titled with the project). */
  title?: string | null;
}

/**
 * A discussion and the screens opened from it: a thread, search, pinned and
 * starred messages. They share one discussion store (and its polling)
 * through DiscussionProvider. The scope says which discussion (a committee's
 * or a project's chat) and where its screens live.
 *
 * The main list stays mounted under them (KeepAlive), so going back shows it
 * as it was. So does search while a thread opened from it is on top.
 */
export const DiscussionRoutes = ({ scope, title }: RoutesProps) => {
  const { pathname } = useLocation();
  const { paths } = scope;
  const onMain = isAt(pathname, paths.main);
  const onSearch = isAt(pathname, paths.search);
  const onThread = isAt(pathname, paths.threadPattern);

  // Search is in the back stack while on show and while a thread opened from
  // it is; going back to the main list drops it.
  const [searchInStack, setSearchInStack] = useState(onSearch);
  useEffect(() => {
    if (onSearch) setSearchInStack(true);
    else if (!onThread) setSearchInStack(false);
  }, [onSearch, onThread]);

  return (
    <DiscussionProvider scope={scope} title={title}>
      <KeepAlive active={onMain}>
        <DiscussionsScreen active={onMain} />
      </KeepAlive>
      {(onSearch || (onThread && searchInStack)) && (
        <KeepAlive active={onSearch}>
          <SearchScreen />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={[paths.mainPattern, paths.searchPattern]} render={() => null} />
        <Route exact component={ThreadScreen} path={paths.threadPattern} />
        <Route exact path={paths.pinnedPattern} render={() => <SavedMessagesScreen kind="pinned" />} />
        <Route exact path={paths.starredPattern} render={() => <SavedMessagesScreen kind="starred" />} />
        <Redirect to={paths.main} />
      </Switch>
    </DiscussionProvider>
  );
};

/** Workspace → Discussions: a committee's discussion. */
export const DiscussionFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const scope = useCommitteeDiscussionScope(committeeId);
  return <DiscussionRoutes scope={scope} />;
};
