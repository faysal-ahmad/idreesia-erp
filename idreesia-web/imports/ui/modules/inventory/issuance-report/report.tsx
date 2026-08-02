import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import { Button, DatePicker, Spin, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {
  keyBy,
  keys,
  reverse,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import type {
  IssuanceFormsByMonthQuery,
  IssuanceFormsByMonthQueryVariables,
  LocationsByPhysicalStoreIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';

type IssuanceForm = NonNullable<
  NonNullable<IssuanceFormsByMonthQuery['issuanceFormsByMonth']>[number]
>;

type IssuanceItem = NonNullable<
  NonNullable<NonNullable<IssuanceForm['items']>[number]>
>;

type LocationRow = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
> & { _id: string; name: string };

interface LocationSummary {
  locationId: string;
  locationName: string;
  quantity: number;
}

interface IssuanceSummaryItem {
  stockItemId: string;
  stockItemName: string;
  stockItemImageId?: string;
  categoryName?: string;
  unitOfMeasurement?: string;
  byLocation: Record<string, LocationSummary>;
  quantity: number;
}

interface ReportProps {
  month: Dayjs;
  monthString: string;
  physicalStoreId: string;
  setPageParams(params: { month: Dayjs | null }): void;
  locations: LocationRow[];
}

const ISSUANCE_FORMS_BY_MONTH: TypedDocumentNode<
  IssuanceFormsByMonthQuery,
  IssuanceFormsByMonthQueryVariables
> = gql`
  query issuanceFormsByMonth($physicalStoreId: String!, $month: String!) {
    issuanceFormsByMonth(physicalStoreId: $physicalStoreId, month: $month) {
      _id
      issueDate
      locationId
      items {
        stockItemId
        quantity
        isInflow
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
  month,
  monthString,
  physicalStoreId,
  locations,
  setPageParams,
}: ReportProps) => {
  const { data, loading } = useQuery(ISSUANCE_FORMS_BY_MONTH, {
    variables: { physicalStoreId, month: monthString },
  });

  const columns: any[] = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (_text: unknown, record: IssuanceSummaryItem) => (
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
      title: 'Issued',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: IssuanceSummaryItem) => {
        let quantity: number | string = text;
        if (record.unitOfMeasurement !== 'quantity') {
          quantity = `${quantity} ${record.unitOfMeasurement}`;
        }

        return quantity;
      },
    },
    {
      title: 'Issued (By Location)',
      dataIndex: 'byLocation',
      key: 'byLocation',
      render: (
        byLocation: Record<string, LocationSummary>,
        record: IssuanceSummaryItem
      ) => {
        const locationIds = keys(byLocation);
        const locationNodes: React.ReactNode[] = [];
        locationIds.forEach((locationId: string) => {
          const locationObj = byLocation[locationId];
          let nodeText = `${locationObj.locationName} - ${locationObj.quantity}`;
          if (record.unitOfMeasurement !== 'quantity') {
            nodeText = `${nodeText} ${record.unitOfMeasurement}`;
          }

          locationNodes.push(<li key={locationId}>{nodeText}</li>);
        });

        return <ul>{locationNodes}</ul>;
      },
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

  const getTableHeader = () => (
    <div className="list-table-header">
      <div>
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
    </div>
  );

  const getIssuanceSummary = () => {
    const locationsMap = keyBy(locations, '_id');
    const issuanceSummary: IssuanceSummaryItem[] = [];
    const issuanceSummaryMap: Record<string, IssuanceSummaryItem> = {};

    const issuanceFormsByMonth = data?.issuanceFormsByMonth;
    if (!issuanceFormsByMonth) return null;

    issuanceFormsByMonth
      .filter((form): form is IssuanceForm => form != null)
      .forEach((issuanceForm) => {
        const { locationId, items } = issuanceForm;
        (items ?? [])
          .filter((item): item is IssuanceItem => item != null)
          .forEach((item) => {
            const refStockItem = item.refStockItem;
            if (!item.stockItemId || !refStockItem?.name) {
              return;
            }

            let summaryItem = issuanceSummaryMap[item.stockItemId];
            if (!summaryItem) {
              summaryItem = {
                stockItemId: item.stockItemId,
                stockItemName: refStockItem.name,
                stockItemImageId: refStockItem.imageId ?? undefined,
                categoryName: refStockItem.categoryName ?? undefined,
                unitOfMeasurement: refStockItem.unitOfMeasurement ?? undefined,
                byLocation: {},
                quantity: 0,
              };

              issuanceSummary.push(summaryItem);
              issuanceSummaryMap[item.stockItemId] = summaryItem;
            }

            const quantity = item.quantity ?? 0;

            if (item.isInflow) {
              summaryItem.quantity -= quantity;

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
            } else {
              summaryItem.quantity += quantity;

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
            }
          });
      });

    return reverse(sortBy(issuanceSummary, 'quantity'));
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Table
      rowKey="stockItemId"
      title={getTableHeader}
      dataSource={getIssuanceSummary() ?? []}
      columns={columns}
      size="small"
      pagination={false}
      bordered
    />
  );
};

export default Report;
