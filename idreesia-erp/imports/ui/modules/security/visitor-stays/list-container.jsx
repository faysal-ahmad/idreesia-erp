import React, { Component } from "react";
import PropTypes from "prop-types";

import List from "./list";

export default class ListContainer extends Component {
  static propTypes = {
    visitorId: PropTypes.string,
    showNewButton: PropTypes.bool,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {};

  render() {
    const { visitorId, showNewButton } = this.props;
    const { pageIndex, pageSize } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        visitorId={visitorId}
        showNewButton={showNewButton}
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}
