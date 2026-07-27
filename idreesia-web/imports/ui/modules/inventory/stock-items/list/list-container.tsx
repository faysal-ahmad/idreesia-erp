import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

import List from './list';

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
}

interface QueryParams {
  categoryId?: string;
  name?: string;
  verifyDuration?: string;
  stockLevel?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}

interface StockItem {
  _id: string;
}

interface ListContainerProps {
  history: HistoryLike;
  location: LocationLike;
  queryString?: string;
  queryParams: QueryParams;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
}

interface PageParams {
  name?: string | null;
  categoryId?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
  pageIndex?: number;
  pageSize?: number;
}

class ListContainer extends Component<ListContainerProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
  };

  setPageParams = (newParams: PageParams) => {
    const {
      name,
      categoryId,
      verifyDuration,
      stockLevel,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let nameVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'name')) nameVal = name || '';
    else nameVal = queryParams.name || '';

    let categoryIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'categoryId'))
      categoryIdVal = categoryId || '';
    else categoryIdVal = queryParams.categoryId || '';

    let verifyDurationVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'verifyDuration'))
      verifyDurationVal = verifyDuration || '';
    else verifyDurationVal = queryParams.verifyDuration || '';

    let stockLevelVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'stockLevel'))
      stockLevelVal = stockLevel || '';
    else stockLevelVal = queryParams.stockLevel || '';

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?name=${nameVal}&categoryId=${categoryIdVal}&verifyDuration=${verifyDurationVal}&stockLevel=${stockLevelVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsNewFormPath(physicalStoreId));
  };

  handleItemSelected = (stockItem: StockItem) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsEditFormPath(physicalStoreId, stockItem._id));
  };

  render() {
    const { physicalStoreId } = this.props;
    const {
      queryParams: {
        categoryId,
        name,
        verifyDuration,
        stockLevel,
        pageIndex,
        pageSize,
      },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <List
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        name={name}
        categoryId={categoryId}
        verifyDuration={verifyDuration}
        stockLevel={stockLevel}
        physicalStoreId={physicalStoreId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        showActions
        showSelectionColumn
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Items, List`;
    }
    return `Inventory, Stock Items, List`;
  })
)(ListContainer as any);
