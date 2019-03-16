import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, DatePicker, Table } from "antd";
import { compose } from "react-apollo";
import { keyBy, sortBy } from "lodash";
import numeral from "numeral";

import {
  WithAccountHeadsByCompany,
  WithAccountMonthlyBalancesByCompany,
} from "/imports/ui/modules/accounts/common/composers";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    month: PropTypes.object,
    monthString: PropTypes.string,
    companyId: PropTypes.string,
    company: PropTypes.object,
    setPageParams: PropTypes.func,
    accountHeadsLoading: PropTypes.bool,
    accountHeadsByCompanyId: PropTypes.array,
    accountMonthlyBalancesLoading: PropTypes.bool,
    accountMonthlyBalancesByCompanyId: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const nameText = `[${record.number}] ${record.name}`;
        if (record.hasChildren) {
          return <b>{`${nameText}`}</b>;
        }
        return nameText;
      },
    },
    {
      title: "Previous Balance",
      dataIndex: "prevBalance",
      key: "prevBalance",
      render: text => numeral(text).format("0,0"),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: text => numeral(text).format("0,0"),
    },
    {
      title: "Debits",
      dataIndex: "debits",
      key: "debits",
      render: text => numeral(text).format("0,0"),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: text => numeral(text).format("0,0"),
    },
  ];

  treeify(
    list,
    idAttr = "number",
    parentAttr = "parent",
    childrenAttr = "children"
  ) {
    const sortedList = sortBy(list, "number");
    const treeList = [];
    const lookup = {};
    sortedList.forEach(obj => {
      lookup[obj[idAttr]] = obj;
      // eslint-disable-next-line no-param-reassign
      obj[childrenAttr] = [];
    });

    sortedList.forEach(obj => {
      if (obj[parentAttr] !== 0) {
        lookup[obj[parentAttr]][childrenAttr].push(obj);
      } else {
        treeList.push(obj);
      }
    });

    sortedList.forEach(obj => {
      if (obj[childrenAttr].length === 0) {
        // eslint-disable-next-line no-param-reassign
        delete obj[childrenAttr];
      }
    });

    return treeList;
  }

  handleMonthChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value,
    });
  };

  handleMonthGoBack = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: month.clone().subtract(1, "months"),
    });
  };

  handleMonthGoForward = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: month.clone().add(1, "months"),
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
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            defaultValue={month}
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

  render() {
    const {
      accountHeadsLoading,
      accountHeadsByCompanyId,
      accountMonthlyBalancesLoading,
      accountMonthlyBalancesByCompanyId,
    } = this.props;

    if (accountHeadsLoading || accountMonthlyBalancesLoading) return null;
    const accountMonthlyBalancesMap = keyBy(
      accountMonthlyBalancesByCompanyId,
      "accountHeadId"
    );
    debugger;
    // Put the monthly balance values into the account heads
    const accountHeadsWithBalances = accountHeadsByCompanyId.map(
      accountHead => {
        const monthlyBalance = accountMonthlyBalancesMap[accountHead._id] || {
          prevBalance: 0,
          credits: 0,
          debits: 0,
          balance: 0,
        };

        return Object.assign({}, accountHead, {
          prevBalance: monthlyBalance.prevBalance,
          credits: monthlyBalance.credits,
          debits: monthlyBalance.debits,
          balance: monthlyBalance.balance,
        });
      }
    );

    const treeDataSource = this.treeify(accountHeadsWithBalances);

    return (
      <Table
        rowKey="_id"
        title={this.getTableHeader}
        dataSource={treeDataSource}
        columns={this.columns}
        pagination={false}
        bordered
      />
    );
  }
}

export default compose(
  WithAccountHeadsByCompany(),
  WithAccountMonthlyBalancesByCompany()
)(List);
