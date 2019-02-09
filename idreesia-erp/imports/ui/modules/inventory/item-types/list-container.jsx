import React, { Component } from "react";
import PropTypes from "prop-types";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
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

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemTypesNewFormPath);
  };

  handleItemSelected = itemType => {
    const { history } = this.props;
    history.push(`${paths.itemTypesPath}/${itemType._id}`);
  };

  render() {
    const { pageIndex, pageSize, itemCategoryId, itemTypeName } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        itemCategoryId={itemCategoryId}
        itemTypeName={itemTypeName}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}

export default WithBreadcrumbs(["Inventory", "Setup", "Item Types", "List"])(
  ListContainer
);
