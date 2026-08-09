import React, { useEffect, useMemo, useRef, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  DatePicker,
  Pagination,
  Space,
  Spin,
  Table,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
} from '@ant-design/icons';

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
import { StockItemName } from '/imports/ui/modules/stores/common/controls';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

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

const buildIssuanceSummary = (
  forms: Array<IssuanceForm | null | undefined>,
  locations: LocationRow[]
): IssuanceSummaryItem[] => {
  const locationsMap = keyBy(locations, '_id');
  const issuanceSummary: IssuanceSummaryItem[] = [];
  const issuanceSummaryMap: Record<string, IssuanceSummaryItem> = {};

  forms
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

const Report = ({
  month,
  monthString,
  physicalStoreId,
  locations,
  setPageParams,
}: ReportProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, refetch } = useQuery(ISSUANCE_FORMS_BY_MONTH, {
    variables: { physicalStoreId, month: monthString },
  });

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY((prev) =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  useEffect(() => {
    setPageIndex(0);
  }, [monthString]);

  const issuanceSummary = useMemo(
    () =>
      buildIssuanceSummary(data?.issuanceFormsByMonth ?? [], locations),
    [data?.issuanceFormsByMonth, locations]
  );

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

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalResults = issuanceSummary.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = issuanceSummary.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

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
      width: 160,
    },
    {
      title: 'Issued',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
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

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={8}>
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleMonthGoBack}
        />
        <DatePicker
          picker="month"
          allowClear={false}
          format="MMM, YYYY"
          onChange={handleMonthChange}
          value={month}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleMonthGoForward}
        />
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="stockItemId"
        title={getTableHeader}
        dataSource={pageData}
        columns={columns}
        size="middle"
        tableLayout="fixed"
        pagination={false}
        bordered
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={safePageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default Report;
