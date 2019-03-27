import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, DatePicker, Drawer, Spin, Table } from "antd";
import { compose } from "react-apollo";
import { keyBy, sortBy } from "lodash";
import numeral from "numeral";

import {
  WithAccountHeadsByCompany,
  WithAccountMonthlyBalancesByCompany,
} from "/imports/ui/modules/accounts/common/composers";

import { VoucherDetailsList } from "../voucher-details";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

const ClickableNumberStyle = {
  cursor: "pointer",
  color: "#1890ff",
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

  state = {
    showForm: false,
    accountHeadWithMonthlyBalances: null,
    includeCredits: true,
    includeDebits: true,
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
      render: (text, record) => {
        const Style = text !== 0 ? ClickableNumberStyle : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleCreditValueClicked(record);
            }}
          >
            {numeral(text).format("0,0")}
          </div>
        );
      },
    },
    {
      title: "Debits",
      dataIndex: "debits",
      key: "debits",
      render: (text, record) => {
        const Style = text !== 0 ? ClickableNumberStyle : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleDebitValueClicked(record);
            }}
          >
            {numeral(text).format("0,0")}
          </div>
        );
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text, record) => {
        const Style = text !== 0 ? ClickableNumberStyle : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleBalanceValueClicked(record);
            }}
          >
            {numeral(text).format("0,0")}
          </div>
        );
      },
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

  handleCreditValueClicked = accountHeadWithMonthlyBalances => {
    this.setState({
      showForm: true,
      accountHeadWithMonthlyBalances,
      includeCredits: true,
      includeDebits: false,
    });
  };

  handleDebitValueClicked = accountHeadWithMonthlyBalances => {
    this.setState({
      showForm: true,
      accountHeadWithMonthlyBalances,
      includeCredits: false,
      includeDebits: true,
    });
  };

  handleBalanceValueClicked = accountHeadWithMonthlyBalances => {
    this.setState({
      showForm: true,
      accountHeadWithMonthlyBalances,
      includeCredits: true,
      includeDebits: true,
    });
  };

  handleClose = () => {
    this.setState({
      showForm: false,
      accountHeadWithMonthlyBalances: null,
      filterBy: null,
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

  getVoucherDetailsList = () => {
    const { month } = this.props;
    const {
      accountHeadWithMonthlyBalances,
      includeCredits,
      includeDebits,
    } = this.state;

    if (!accountHeadWithMonthlyBalances) return null;

    return (
      <VoucherDetailsList
        companyId={accountHeadWithMonthlyBalances.companyId}
        accountHeadIds={[accountHeadWithMonthlyBalances._id]}
        startDate={month.clone().startOf("month")}
        endDate={month.clone().endOf("month")}
        includeCredits={includeCredits}
        includeDebits={includeDebits}
      />
    );
  };

  render() {
    const {
      accountHeadsLoading,
      accountHeadsByCompanyId,
      accountMonthlyBalancesLoading,
      accountMonthlyBalancesByCompanyId,
    } = this.props;
    const { showForm } = this.state;

    if (accountHeadsLoading || accountMonthlyBalancesLoading) {
      return <Spin size="large" />;
    }

    const accountMonthlyBalancesMap = keyBy(
      accountMonthlyBalancesByCompanyId,
      "accountHeadId"
    );

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
      <Fragment>
        <Table
          rowKey="_id"
          title={this.getTableHeader}
          dataSource={treeDataSource}
          columns={this.columns}
          pagination={false}
          bordered
        />
        <Drawer
          title="Vouchers List"
          width={800}
          placement="left"
          onClose={this.handleClose}
          visible={showForm}
          style={{
            overflow: "auto",
            height: "calc(100% - 108px)",
            paddingBottom: "108px",
          }}
        >
          {this.getVoucherDetailsList()}
        </Drawer>
      </Fragment>
    );
  }
}

export default compose(
  WithAccountHeadsByCompany(),
  WithAccountMonthlyBalancesByCompany()
)(List);
