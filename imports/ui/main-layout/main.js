import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { InventoryRouter } from '../inventory';

class Main extends Component {
  render() {
    return (
      <main role="main" className="col-sm-9 ml-sm-auto col-md-10 pt-3">
        <Switch>
          <Route exact path="/" render={props => <div />} />
          <Route path="/inventory" component={InventoryRouter} />
        </Switch>
      </main>
    );
  }
}

export default Main;
