import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { MessagesList, MessagesNewForm, MessagesEditForm } from './messages';

const Router = () => (
  <Switch>
    <Route path={paths.messagesNewFormPath} component={MessagesNewForm} />
    <Route path={paths.messagesEditFormPath()} component={MessagesEditForm} />
    <Route path={paths.messagesPath} component={MessagesList} />
  </Switch>
);

export default Router;
