import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { useDispatch } from 'react-redux';

import { setLoggedInUser } from 'meteor/idreesia-common/action-creators';
import { MainLayout } from './main-layout';

const App = ({ user }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setLoggedInUser(user || null));
  });

  return (
    <Switch>
      <Route path="/" component={MainLayout} />
    </Switch>
  );
};

App.propTypes = {
  user: PropTypes.object,
  isOnline: PropTypes.bool,
};

export default withTracker(() => ({
  user: Meteor.user(),
  isOnline: Meteor.status().connected,
}))(App);
