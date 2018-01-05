import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { InventorySidebar } from '../inventory';

class Sidebar extends Component {
  render() {
    return (
      <nav className="col-sm-3 col-md-2 d-none d-sm-block bg-light sidebar">
        <ul className="nav nav-pills flex-column">
          <Switch>
            <Route path="/inventory" component={InventorySidebar} />
          </Switch>
        </ul>
      </nav>
    );
  }
}

export default Sidebar;
