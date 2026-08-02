import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import numeral from 'numeral';
import { Button, DatePicker, Spin, Row, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {
  keyBy,
  keys,
  reverse,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import type {
  LocationsByPhysicalStoreIdQuery,
  PurchaseFormsByMonthQuery,
  PurchaseFormsByMonthQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';

type PurchaseForm = NonNullable<
  NonNullable<PurchaseFormsByMonthQuery['purchaseFormsByMonth']>[number]
>;

type PurchaseItem = NonNullable<
  NonNullable<NonNullable<PurchaseForm['items']>[number]>
>;

type LocationRow = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
> & { _id: string; name: string };

interface LocationSummary {
  locationId: string;
  locationName: string;
  quantity: number;
}

interface PurchaseSummaryItem {
  stockItemId: string;
  stockItemName: string;
  stockItemImageId?: string;
  categoryName?: string;
  unitOfMeasurement?: string;
  byLocation: Record<string, LocationSummary>;
  inflow: number;
  outflow: number;
  quantity: number;
  cost: number;
}

interface ReportProps {
  physicalStoreId: string;
  month: Dayjs;
  monthString: string;
  locations: LocationRow[];
  setPageParams(params: { month: Dayjs | null }): void;
}

const PURCHASE_FORMS_BY_MONTH: TypedDocumentNode<
  PurchaseFormsByMonthQuery,
  PurchaseFormsByMonthQueryVariables
> = gql`
  query purchaseFormsByMonth($physicalStoreId: String!, $month: String!) {
    purchaseFormsByMonth(physicalStoreId: $physicalStoreId, month: $month) {
      _id
      purchaseDate
      locationId
      items {
        stockItemId
        quantity
        isInflow
        price
        refStockItem {
          _id
          name
          imageId
          categoryName
          unitOfMeasurement
        }
      }
    }
  }
`;

const Report = ({
  physicalStoreId,
  month,
  monthString,
  locations,
  setPageParams,
}: ReportProps) => {
  const { data, loading } = useQuery(PURCHASE_FORMS_BY_MONTH, {
    variables: { physicalStoreId, month: monthString },
  });

  const columns: any[] = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (_text: unknown, record: PurchaseSummaryItem) => (
        <StockItemName
          stockItem={{
            _id: record.stockItemId,
            physicalStoreId,
            name: record.stockItemName,
            imageId: record.stockItemImageId,
          }}
        />
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Purchased',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: PurchaseSummaryItem) => {
        let quantity: number | string = text;
        if (record.unitOfMeasurement !== 'quantity') {
          quantity = `${quantity} ${record.unitOfMeasurement}`;
        }

        return quantity;
      },
    },
    {
      title: 'Purchased (By Location)',
      dataIndex: 'byLocation',
      key: 'byLocation',
      render: (
        byLocation: Record<string, LocationSummary>,
        record: PurchaseSummaryItem
      ) => {
        const locationIds = keys(byLocation);
        const locationNodes: React.ReactNode[] = [];
        locationIds.forEach((locationId: string) => {
          const locationObj = byLocation[locationId];
          let nodeText = `${locationObj.locationName} - ${locationObj.quantity}`;
          if (record.unitOfMeasurement !== 'quantity') {
            nodeText = `${nodeText} ${record.unitOfMeasurement}`;
          }

          locationNodes.push(<Row key={locationId}>{nodeText}</Row>);
        });

        return locationNodes;
      },
    },
    {
      title: 'Unit Price (Rs)',
      key: 'unitPrice',
      render: (_text: unknown, record: PurchaseSummaryItem) => {
        const { quantity, cost } = record;
        const unitPrice = (cost / quantity).toFixed(0);
        return numeral(unitPrice).format('0,0');
      },
    },
    {
      title: 'Total Cost (Rs)',
      dataIndex: 'cost',
      key: 'cost',
      render: (text: number) => numeral(text).format('0,0'),
    },
  ];

  const handleMonthChange = (value: Dayjs | null) => {
    setPageParams({
      month: value,
    });
  };

  const handleMonthGoBack = () => {
    setPageParams({
      month: dayjs(month).subtract(1, 'months'),
    });
  };

  const handleMonthGoForward = () => {
    setPageParams({
      month: dayjs(month).add(1, 'months'),
    });
  };

  const locationsMap = keyBy(locations, '_id');
  const purchaseSummary: PurchaseSummaryItem[] = [];
  const purchaseSummaryMap: Record<string, PurchaseSummaryItem> = {};

  (data?.purchaseFormsByMonth ?? [])
    .filter((form): form is PurchaseForm => form != null)
    .forEach((purchaseForm) => {
      const { locationId, items } = purchaseForm;
      (items ?? [])
        .filter((item): item is PurchaseItem => item != null)
        .forEach((item) => {
          const refStockItem = item.refStockItem;
          if (!item.stockItemId || !refStockItem?.name) {
            return;
          }

          let summaryItem = purchaseSummaryMap[item.stockItemId];
          if (!summaryItem) {
            summaryItem = {
              stockItemId: item.stockItemId,
              stockItemName: refStockItem.name,
              stockItemImageId: refStockItem.imageId ?? undefined,
              categoryName: refStockItem.categoryName ?? undefined,
              unitOfMeasurement: refStockItem.unitOfMeasurement ?? undefined,
              byLocation: {},
              inflow: 0,
              outflow: 0,
              quantity: 0,
              cost: 0,
            };

            purchaseSummary.push(summaryItem);
            purchaseSummaryMap[item.stockItemId] = summaryItem;
          }

          const quantity = item.quantity ?? 0;
          const price = item.price ?? 0;

          if (item.isInflow) {
            summaryItem.inflow += quantity;
            summaryItem.quantity += quantity;
            summaryItem.cost += price;

            if (locationId && locationsMap[locationId]) {
              if (!summaryItem.byLocation[locationId]) {
                summaryItem.byLocation[locationId] = {
                  locationId,
                  locationName: locationsMap[locationId].name,
                  quantity,
                };
              } else {
                summaryItem.byLocation[locationId].quantity += quantity;
              }
            }
          } else {
            summaryItem.outflow += quantity;
            summaryItem.quantity -= quantity;
            summaryItem.cost -= price;

            if (locationId && locationsMap[locationId]) {
              if (!summaryItem.byLocation[locationId]) {
                summaryItem.byLocation[locationId] = {
                  locationId,
                  locationName: locationsMap[locationId].name,
                  quantity: -quantity,
                };
              } else {
                summaryItem.byLocation[locationId].quantity -= quantity;
              }
            }
          }
        });
    });

  const sortedPurchaseSummary = reverse(sortBy(purchaseSummary, 'cost'));

  let totalCost = 0;
  purchaseSummary.forEach(summaryItem => {
    totalCost += summaryItem.cost;
  });

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleMonthGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker
          picker="month"
          allowClear={false}
          format="MMM, YYYY"
          onChange={handleMonthChange}
          value={month}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleMonthGoForward}
        />
      </div>
      <div>
        <h3>
          Total Purchases = Rs. <b>{numeral(totalCost).format('0,0')}</b>
        </h3>
      </div>
    </div>
  );

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Table
      rowKey="stockItemId"
      title={getTableHeader}
      dataSource={sortedPurchaseSummary}
      columns={columns}
      size="small"
      pagination={false}
      bordered
    />
  );
};

export default Report;
