import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { ModulePaths } from '/imports/ui/constants';
import { ProfilesNewForm, ProfilesEditForm, ProfilesList } from './profiles';

class AdminRouter extends Component {
  render() {
    return (
      <Switch>
        <Route path={paths.profilesNewFormPath} component={ProfilesNewForm} />
        <Route path={paths.profilesEditFormPath} component={ProfilesEditForm} />
        <Route path={paths.profilesPath} component={ProfilesList} />
      </Switch>
    );
  }
}

export default AdminRouter;
