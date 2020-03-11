import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { WazaifList, WazaifNewForm, WazaifEditForm } from './wazaif';

import { default as paths } from './submodule-paths';

const Router = () => (
  <Switch>
    <Route path={paths.wazaifNewFormPath} component={WazaifNewForm} />
    <Route path={paths.wazaifEditFormPath()} component={WazaifEditForm} />
    <Route path={paths.wazaifPath} component={WazaifList} />
  </Switch>
);

export default Router;
