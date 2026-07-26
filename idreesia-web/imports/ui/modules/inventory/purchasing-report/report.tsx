import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { Button, DatePicker, Spin, Row, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {
  keyBy,
  keys,
  reverse,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';

const AntButton = Button as any;
const AntDatePickerMonth = DatePicker.MonthPicker as any;
const AntSpin = Spin as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const StockItemNameComponent = StockItemName as any;

interface LocationRecord {
  _id: string;
  name: string;
}

interface PurchaseItem {
  stockItemId: string;
  quantity: number;
  isInflow: boolean;
  price: number;
  refStockItem: {
    name: string;
    imageId?: string;
    categoryName?: string;
    unitOfMeasurement?: string;
  };
}

interface PurchaseForm {
  locationId?: string;
  items: PurchaseItem[];
}

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

interface PurchaseFormsData {
  purchaseFormsByMonth: PurchaseForm[];
}

interface ReportProps {
  physicalStoreId?: string;
  month: dayjs.Dayjs;
  monthString?: string;
  locations?: LocationRecord[];
  setPageParams(params: { month: dayjs.Dayjs | null }): void;
}

const LIST_QUERY = gql`
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
  locations = [],
  setPageParams,
}: ReportProps) => {
  const { data, loading } = useQuery(LIST_QUERY as any, {
    variables: { physicalStoreId, month: monthString },
  });

  if (loading) {
    return <AntSpin size="large" />;
  }

  const columns: any[] = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (_text: unknown, record: PurchaseSummaryItem) => {
        const stockItem = {
          _id: record.stockItemId,
          physicalStoreId,
          name: record.stockItemName,
          imageId: record.stockItemImageId,
        };
        return <StockItemNameComponent stockItem={stockItem} />;
      },
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

          locationNodes.push(<AntRow key={locationId}>{nodeText}</AntRow>);
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

  const handleMonthChange = (value: dayjs.Dayjs | null) => {
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
  const { purchaseFormsByMonth } = (data as PurchaseFormsData) ?? {
    purchaseFormsByMonth: [],
  };
  const purchaseSummary: PurchaseSummaryItem[] = [];
  const purchaseSummaryMap: Record<string, PurchaseSummaryItem> = {};

  purchaseFormsByMonth.forEach((purchaseForm: PurchaseForm) => {
    const { locationId, items } = purchaseForm;
    items.forEach((item: PurchaseItem) => {
      let summaryItem = purchaseSummaryMap[item.stockItemId];
      if (!summaryItem) {
        summaryItem = {
          stockItemId: item.stockItemId,
          stockItemName: item.refStockItem.name,
          stockItemImageId: item.refStockItem.imageId,
          categoryName: item.refStockItem.categoryName,
          unitOfMeasurement: item.refStockItem.unitOfMeasurement,
          byLocation: {},
          inflow: 0,
          outflow: 0,
          quantity: 0,
          cost: 0,
        };

        purchaseSummary.push(summaryItem);
        purchaseSummaryMap[item.stockItemId] = summaryItem;
      }

      if (item.isInflow) {
        summaryItem.inflow += item.quantity;
        summaryItem.quantity += item.quantity;
        summaryItem.cost += item.price;

        if (locationId && locationsMap[locationId]) {
          if (!summaryItem.byLocation[locationId]) {
            summaryItem.byLocation[locationId] = {
              locationId,
              locationName: locationsMap[locationId].name,
              quantity: item.quantity,
            };
          } else {
            summaryItem.byLocation[locationId].quantity += item.quantity;
          }
        }
      } else {
        summaryItem.outflow += item.quantity;
        summaryItem.quantity -= item.quantity;
        summaryItem.cost -= item.price;

        if (locationId && locationsMap[locationId]) {
          if (!summaryItem.byLocation[locationId]) {
            summaryItem.byLocation[locationId] = {
              locationId,
              locationName: locationsMap[locationId].name,
              quantity: -item.quantity,
            };
          } else {
            summaryItem.byLocation[locationId].quantity -= item.quantity;
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
        <AntButton
          type="primary"
          shape="circle"
          icon={<AntLeftOutlined />}
          onClick={handleMonthGoBack}
        />
        &nbsp;&nbsp;
        <AntDatePickerMonth
          allowClear={false}
          format="MMM, YYYY"
          onChange={handleMonthChange}
          value={month}
        />
        &nbsp;&nbsp;
        <AntButton
          type="primary"
          shape="circle"
          icon={<AntRightOutlined />}
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

  return (
    <AntTable
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

Report.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,

  month: PropTypes.object,
  monthString: PropTypes.string,
  physicalStoreId: PropTypes.string,
  setPageParams: PropTypes.func,
  loading: PropTypes.bool,
  locations: PropTypes.array,
  purchaseFormsByMonth: PropTypes.array,
};

export default Report;
