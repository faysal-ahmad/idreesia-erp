import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
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
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsNewFormPath(physicalStoreId));
  };

  handleItemSelected = stockItem => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsEditFormPath(physicalStoreId, stockItem._id));
  };

  render() {
    const { physicalStoreId } = this.props;
    const { pageIndex, pageSize, itemCategoryId, itemTypeName } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        itemCategoryId={itemCategoryId}
        itemTypeName={itemTypeName}
        physicalStoreId={physicalStoreId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}

export default compose(
  WithPhysicalStoreId(),
  WithBreadcrumbs(["Inventory", "Stock Items", "List"])
)(ListContainer);
