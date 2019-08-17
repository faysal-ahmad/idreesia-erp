import React, { Component } from "react";
import PropTypes from "prop-types";
import { flowRight } from "lodash";
import { toSafeInteger } from "lodash";

import { WithDynamicBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from "/imports/ui/modules/inventory/common/composers";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
  };

  setPageParams = newParams => {
    const { name, categoryId, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let nameVal;
    if (newParams.hasOwnProperty("name")) nameVal = name || "";
    else nameVal = queryParams.name || "";

    let categoryIdVal;
    if (newParams.hasOwnProperty("categoryId"))
      categoryIdVal = categoryId || "";
    else categoryIdVal = queryParams.categoryId || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?name=${nameVal}&categoryId=${categoryIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
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
    const {
      queryParams: { categoryId, name, pageIndex, pageSize },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <List
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        name={name}
        categoryId={categoryId}
        physicalStoreId={physicalStoreId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        showActions
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Items, List`;
    }
    return `Inventory, Stock Items, List`;
  })
)(ListContainer);
