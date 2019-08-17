import React, { Component } from "react";
import PropTypes from "prop-types";

import List from "../list/list";

export default class ListContainer extends Component {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    setSelectedValue: PropTypes.func,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
    categoryId: null,
    name: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { physicalStoreId, setSelectedValue } = this.props;
    const { pageIndex, pageSize, categoryId, name } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        physicalStoreId={physicalStoreId}
        categoryId={categoryId}
        name={name}
        setPageParams={this.setPageParams}
        handleItemSelected={setSelectedValue}
      />
    );
  }
}
