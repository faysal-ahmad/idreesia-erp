import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Spin, Table } from 'antd';
import { flowRight } from 'lodash';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  width: '100%',
};

class Report extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    month: PropTypes.object,
    monthString: PropTypes.string,
    setPageParams: PropTypes.func,
    loading: PropTypes.bool,
    purchaseFormsByMonth: PropTypes.array,
  };

  columns = [
    {
      title: 'Item Name',
      dataIndex: 'stockItemName',
      key: 'stockItemName',
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
    },
    {
      title: 'Total Cost',
      dataIndex: 'cost',
      key: 'cost',
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
      month: month.clone().subtract(1, 'months'),
    });
  };

  handleMonthGoForward = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: month.clone().add(1, 'months'),
    });
  };

  getTableHeader = () => {
    const { month } = this.props;
    return (
      <div style={ToolbarStyle}>
        <div>
          <Button
            type="primary"
            shape="circle"
            icon="left"
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
            icon="right"
            onClick={this.handleMonthGoForward}
          />
        </div>
      </div>
    );
  };

  getPurchaseSummary = () => {
    const purchaseSummary = [];
    const purchaseSummaryMap = {};

    const { purchaseFormsByMonth } = this.props;
    purchaseFormsByMonth.forEach(purchaseForm => {
      const { items } = purchaseForm;
      items.forEach(item => {
        let summaryItem = purchaseSummaryMap[item.stockItemId];
        if (!summaryItem) {
          summaryItem = {
            stockItemId: item.stockItemId,
            stockItemName: item.stockItemName,
            categoryName: item.categoryName,
            quantity: 0,
            cost: 0,
          };

          purchaseSummary.push(summaryItem);
          purchaseSummaryMap[item.stockItemId] = summaryItem;
        }

        if (item.isInflow) {
          summaryItem.quantity += item.quantity;
          summaryItem.cost += item.price;
        } else {
          summaryItem.quantity -= item.quantity;
          summaryItem.cost -= item.price;
        }
      });
    });

    return purchaseSummary;
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
        dataSource={this.getPurchaseSummary()}
        columns={this.columns}
        size="small"
        pagination={false}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query purchaseFormsByMonth($physicalStoreId: String!, $month: String!) {
    purchaseFormsByMonth(physicalStoreId: $physicalStoreId, month: $month) {
      _id
      purchaseDate
      items {
        stockItemId
        quantity
        isInflow
        price
        stockItemName
        categoryName
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
