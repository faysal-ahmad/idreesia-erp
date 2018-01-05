import React, { Component } from 'react';

import { Header, Sidebar, Main } from './main-layout';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <Main />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
