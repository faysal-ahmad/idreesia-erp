import React from "react";
import { Switch, Route } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";

import combinedReducer from "./reducers/combined-reducer";
import { LoggedInRoute, LoggedOutRoute } from "./main-layout";

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

export default App;
