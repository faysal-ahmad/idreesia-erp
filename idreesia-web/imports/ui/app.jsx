import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import { setLoggedInUser } from 'meteor/idreesia-common/action-creators';
import combinedReducer from './reducers/combined-reducer';
import { LoggedInRoute, LoggedOutRoute } from './main-layout';

const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));

const App = () => {
  const userId = Meteor.userId();

  if (userId) {
    return (
      <Provider store={store}>
        <Switch>
          <Route path="/" component={LoggedInRoute} />
        </Switch>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <Switch>
        <Route path="/" component={LoggedOutRoute} />
      </Switch>
    </Provider>
  );
};

App.propTypes = {
  userId: PropTypes.string,
};

export default withTracker(() => {
  setLoggedInUser(Meteor.user());
  return {
    userId: Meteor.userId(),
  };
})(App);