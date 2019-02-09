import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import List from "../list/list";
import ListFilter from "../list/list-filter";

export default class ListContainer extends Component {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    setSelectedValue: PropTypes.func,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
    itemCategoryId: null,
    itemTypeName: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { physicalStoreId, setSelectedValue } = this.props;
    const { pageIndex, pageSize, itemCategoryId, itemTypeName } = this.state;

    return (
      <Fragment>
        <ListFilter
          itemCategoryId={itemCategoryId}
          itemTypeName={itemTypeName}
          setPageParams={this.setPageParams}
        />
        <List
          pageIndex={pageIndex}
          pageSize={pageSize}
          physicalStoreId={physicalStoreId}
          itemCategoryId={itemCategoryId}
          itemTypeName={itemTypeName}
          setPageParams={this.setPageParams}
          handleItemSelected={setSelectedValue}
        />
      </Fragment>
    );
  }
}
