import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { useDispatch } from 'react-redux';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { LoggedInRoute, LoggedOutRoute } from './main-layout';

const App = ({ userId }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setLoggedInUserId(userId || null));
  });

  if (userId) {
    return (
      <Switch>
        <Route path="/" component={LoggedInRoute} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LoggedOutRoute} />
    </Switch>
  );
};

App.propTypes = {
  userId: PropTypes.string,
  isOnline: PropTypes.bool,
};

export default withTracker(() => ({
  userId: Meteor.userId(),
  isOnline: Meteor.status().connected,
}))(App);
