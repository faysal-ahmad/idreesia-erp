import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';

import combinedReducer from './reducers/combined-reducer';
import { LoggedInRoute } from './main-layout';

const store = createStore(combinedReducer, applyMiddleware(thunkMiddleware));

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Switch>
          <Route path="/" component={LoggedInRoute} />;
        </Switch>
      </Provider>
    );
  }
}

export default App;
