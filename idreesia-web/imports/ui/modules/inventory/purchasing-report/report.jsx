import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
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
  locations,
  setPageParams,
}) => {
  const { data, loading } = useQuery(LIST_QUERY, {
    variables: { physicalStoreId, month: monthString },
  });

  if (loading) {
    return <Spin size="large" />;
  }

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (text, record) => {
        const stockItem = {
          _id: record.stockItemId,
          physicalStoreId,
          name: record.stockItemName,
          imageId: record.stockItemImageId,
        };
        return <StockItemName stockItem={stockItem} />;
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
      render: (text, record) => {
        let quantity = text;
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
      render: (byLocation, record) => {
        const locationIds = keys(byLocation);
        const locationNodes = [];
        locationIds.forEach(locationId => {
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
      render: (text, record) => {
        const { quantity, cost } = record;
        const unitPrice = (cost / quantity).toFixed(0);
        return numeral(unitPrice).format('0,0');
      },
    },
    {
      title: 'Total Cost (Rs)',
      dataIndex: 'cost',
      key: 'cost',
      render: text => numeral(text).format('0,0'),
    },
  ];

  const handleMonthChange = value => {
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
  const { purchaseFormsByMonth } = data;
  const purchaseSummary = [];
  const purchaseSummaryMap = {};

  purchaseFormsByMonth.forEach(purchaseForm => {
    const { locationId, items } = purchaseForm;
    items.forEach(item => {
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
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleMonthGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker.MonthPicker
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
