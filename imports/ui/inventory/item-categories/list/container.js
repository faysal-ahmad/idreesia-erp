import React, { Component } from 'react';

class Container extends React.Component {
  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.inventoryItemTypesNewFormPath);
  };

  render() {
    return <h2>Item Categories</h2>;
  }
}

export default Container;
