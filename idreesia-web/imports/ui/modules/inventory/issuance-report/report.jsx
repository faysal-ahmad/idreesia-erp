import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import dayjs from 'dayjs';
import { Button, DatePicker, Spin, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {
  flowRight,
  keyBy,
  keys,
  reverse,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';

class Report extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    month: PropTypes.object,
    monthString: PropTypes.string,
    physicalStoreId: PropTypes.string,
    setPageParams: PropTypes.func,
    loading: PropTypes.bool,
    locations: PropTypes.array,
    issuanceFormsByMonth: PropTypes.array,
  };

  columns = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
      render: (text, record) => {
        const { physicalStoreId } = this.props;
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
      title: 'Issued',
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
      title: 'Issued (By Location)',
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

          locationNodes.push(<li key={locationId}>{nodeText}</li>);
        });

        return <ul>{locationNodes}</ul>;
      },
    },
  ];

  handleMonthChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value,
    });
  };

  handleMonthGoBack = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: dayjs(month).subtract(1, 'months'),
    });
  };

  handleMonthGoForward = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: dayjs(month).add(1, 'months'),
    });
  };

  getTableHeader = () => {
    const { month } = this.props;
    return (
      <div className="list-table-header">
        <div>
          <Button
            type="primary"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={this.handleMonthGoBack}
          />
          &nbsp;&nbsp;
          <DatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={month}
          />
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon={<RightOutlined />}
            onClick={this.handleMonthGoForward}
          />
        </div>
      </div>
    );
  };

  getIssuanceSummary = () => {
    const { locations } = this.props;
    const locationsMap = keyBy(locations, '_id');
    const issuanceSummary = [];
    const issuanceSummaryMap = {};

    const { issuanceFormsByMonth } = this.props;
    if (!issuanceFormsByMonth) return null;
    issuanceFormsByMonth.forEach(issuanceForm => {
      const { locationId, items } = issuanceForm;
      items.forEach(item => {
        let summaryItem = issuanceSummaryMap[item.stockItemId];
        if (!summaryItem) {
          summaryItem = {
            stockItemId: item.stockItemId,
            stockItemName: item.refStockItem.name,
            stockItemImageId: item.refStockItem.imageId,
            categoryName: item.refStockItem.categoryName,
            unitOfMeasurement: item.refStockItem.unitOfMeasurement,
            byLocation: {},
            quantity: 0,
          };

          issuanceSummary.push(summaryItem);
          issuanceSummaryMap[item.stockItemId] = summaryItem;
        }

        if (item.isInflow) {
          summaryItem.quantity -= item.quantity;

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
        } else {
          summaryItem.quantity += item.quantity;

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
        }
      });
    });

    return reverse(sortBy(issuanceSummary, 'quantity'));
  };

  render() {
    const { loading } = this.props;
    if (loading) {
      return <Spin size="large" />;
    }

    return (
      <Table
        rowKey="stockItemId"
        title={this.getTableHeader}
        dataSource={this.getIssuanceSummary()}
        columns={this.columns}
        size="small"
        pagination={false}
        bordered
      />
    );
  }
}

const listQuery = gql`
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

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId, monthString }) => ({
      variables: { physicalStoreId, month: monthString },
    }),
  })
)(Report);
