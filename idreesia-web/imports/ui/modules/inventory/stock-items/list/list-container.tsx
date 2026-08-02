import React from 'react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedStockItemsQuery } from 'meteor/idreesia-common/types/client-operations';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import List from './list';
import { type PageParams } from './list-filter';

type StockItemRow = NonNullable<
  NonNullable<
    NonNullable<PagedStockItemsQuery['pagedStockItems']>['data']
  >[number]
>;

type Props = RouteComponentProps;

const ListContainer = ({ history, location }: Props) => {
  const { physicalStoreId = '' } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { queryParams } = useQueryParams({ history, location });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Stock Items', 'List']
      : ['Inventory', 'Stock Items', 'List']
  );

  const setPageParams = (newParams: PageParams) => {
    const {
      name,
      categoryId,
      verifyDuration,
      stockLevel,
      pageIndex,
      pageSize,
    } = newParams;

    let nameVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'name')) {
      nameVal = name || '';
    } else {
      nameVal = String(queryParams.name || '');
    }

    let categoryIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'categoryId')) {
      categoryIdVal = categoryId || '';
    } else {
      categoryIdVal = String(queryParams.categoryId || '');
    }

    let verifyDurationVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'verifyDuration')) {
      verifyDurationVal = verifyDuration || '';
    } else {
      verifyDurationVal = String(queryParams.verifyDuration || '');
    }

    let stockLevelVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'stockLevel')) {
      stockLevelVal = stockLevel || '';
    } else {
      stockLevelVal = String(queryParams.stockLevel || '');
    }

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) {
      pageIndexVal = pageIndex ?? 0;
    } else {
      pageIndexVal = queryParams.pageIndex || 0;
    }

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) {
      pageSizeVal = pageSize ?? 20;
    } else {
      pageSizeVal = queryParams.pageSize || 20;
    }

    const path = `${location.pathname}?name=${nameVal}&categoryId=${categoryIdVal}&verifyDuration=${verifyDurationVal}&stockLevel=${stockLevelVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.stockItemsNewFormPath(physicalStoreId));
  };

  const handleItemSelected = (stockItem: StockItemRow) => {
    if (!stockItem._id) return;
    history.push(paths.stockItemsEditFormPath(physicalStoreId, stockItem._id));
  };

  const {
    categoryId,
    name,
    verifyDuration,
    stockLevel,
    pageIndex,
    pageSize,
  } = queryParams;

  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <List
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      name={String(name || '')}
      categoryId={String(categoryId || '')}
      verifyDuration={String(verifyDuration || '')}
      stockLevel={String(stockLevel || '')}
      physicalStoreId={physicalStoreId}
      setPageParams={setPageParams}
      handleItemSelected={handleItemSelected}
      showNewButton
      showActions
      showSelectionColumn
      handleNewClicked={handleNewClicked}
    />
  );
};

export default ListContainer;
