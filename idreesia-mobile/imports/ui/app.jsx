import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import { setLoggedInUser } from 'meteor/idreesia-common/action-creators';
import combinedReducer from './reducers/combined-reducer';
import { MainLayout } from './main-layout';

const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));

const App = () => (
  <Provider store={store}>
    <Switch>
      <Route path="/" component={MainLayout} />
    </Switch>
  </Provider>
);

App.propTypes = {
  user: PropTypes.object,
  isOnline: PropTypes.bool,
};

export default withTracker(() => {
  setLoggedInUser(Meteor.user());
  return {
    user: Meteor.user(),
    isOnline: Meteor.status().connected,
  };
})(App);
