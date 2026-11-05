import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { Inbox } from './inbox';

const Router = () => (
  <Switch>
    {/* One route with an optional :roomId so selecting a conversation doesn't
        remount the inbox (and its conversation list). */}
    <Route path={paths.inboxConversationPath()} component={Inbox} />
  </Switch>
);

export default Router;
