import React, { useState } from 'react';

import type { PagedStockItemsQuery } from 'meteor/idreesia-common/types/client-operations';

import List from '../list/list';
import { type PageParams } from '../list/list-filter';

type StockItem = NonNullable<
  NonNullable<
    NonNullable<PagedStockItemsQuery['pagedStockItems']>['data']
  >[number]
>;

interface Props {
  physicalStoreId?: string;
  setSelectedValue?(stockItem: StockItem): void;
}

const ListContainer = ({ physicalStoreId = '', setSelectedValue }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [verifyDuration, setVerifyDuration] = useState<string | null>(null);
  const [stockLevel, setStockLevel] = useState<string | null>(null);

  const setPageParams = (pageParams: PageParams) => {
    if (Object.prototype.hasOwnProperty.call(pageParams, 'pageIndex')) {
      setPageIndex(pageParams.pageIndex ?? 0);
    }
    if (Object.prototype.hasOwnProperty.call(pageParams, 'pageSize')) {
      setPageSize(pageParams.pageSize ?? 20);
    }
    if (Object.prototype.hasOwnProperty.call(pageParams, 'categoryId')) {
      setCategoryId(pageParams.categoryId ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(pageParams, 'name')) {
      setName(pageParams.name ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(pageParams, 'verifyDuration')) {
      setVerifyDuration(pageParams.verifyDuration ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(pageParams, 'stockLevel')) {
      setStockLevel(pageParams.stockLevel ?? null);
    }
  };

  return (
    <List
      pageIndex={pageIndex}
      pageSize={pageSize}
      physicalStoreId={physicalStoreId}
      categoryId={categoryId ?? undefined}
      name={name ?? undefined}
      verifyDuration={verifyDuration ?? undefined}
      stockLevel={stockLevel ?? undefined}
      setPageParams={setPageParams}
      handleItemSelected={setSelectedValue}
    />
  );
};

export default ListContainer;
