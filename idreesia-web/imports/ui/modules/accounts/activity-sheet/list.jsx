import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, flowRight, keyBy } from 'lodash';
import numeral from 'numeral';

import { Button, DatePicker, Drawer, Spin, Table } from '/imports/ui/controls';
import {
  WithAccountHeadsByCompany,
  WithAccountMonthlyBalancesByCompany,
} from '/imports/ui/modules/accounts/common/composers';

import { treeify } from '/imports/ui/modules/accounts/common/utilities';
import { VoucherDetailsList } from '../voucher-details';

const ClickableNumberStyle = {
  cursor: 'pointer',
  color: '#1890ff',
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const nameText = `[${record.number}] ${record.name}`;
        if (record.hasChildren) {
          return <b>{`${nameText}`}</b>;
        }
        return nameText;
      },
    },
    {
      title: 'Previous Balance',
      dataIndex: 'prevBalance',
      key: 'prevBalance',
      render: text => numeral(text).format('0,0'),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (text, record) => {
        const Style = text !== 0 ? ClickableNumberStyle : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleCreditValueClicked(record);
            }}
          >
            {numeral(text).format('0,0')}
          </div>
        );
      },
    },
    {
      title: 'Debits',
      dataIndex: 'debits',
      key: 'debits',
      render: (text, record) => {
        const Style = text !== 0 ? ClickableNumberStyle : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleDebitValueClicked(record);
            }}
          >
            {numeral(text).format('0,0')}
          </div>
        );
      },
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text, record) => {
        const Style =
          record.credits !== 0 || record.credits !== 0
            ? ClickableNumberStyle
            : null;
        return (
          <div
            style={Style}
            onClick={() => {
              this.handleBalanceValueClicked(record);
            }}
          >
            {numeral(text).format('0,0')}
          </div>
        );
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
      month: month.clone().subtract(1, 'months'),
    });
  };

  handleMonthGoForward = () => {
    const { setPageParams, month } = this.props;
    setPageParams({
      month: month.clone().add(1, 'months'),
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
      <div className="list-table-header">
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

  getChildAccountHeads = accountHead => {
    const { accountHeadsByCompanyId } = this.props;
    // Get all the account heads that have this as parent
    const childAccountHeads = filter(
      accountHeadsByCompanyId,
      _accountHead => _accountHead.parent === accountHead.number
    );

    // If no child account heads are found, simply return
    if (childAccountHeads.length === 0) return childAccountHeads;
    // If we do have some child account heads, then call this method recursively
    // on them, accumulate their responses and return that.
    let accumulatedChildren = [].concat(childAccountHeads);
    childAccountHeads.forEach(childAccountHead => {
      accumulatedChildren = accumulatedChildren.concat(
        this.getChildAccountHeads(childAccountHead)
      );
    });
    return accumulatedChildren;
  };

  getVoucherDetailsList = () => {
    const { month } = this.props;
    const {
      accountHeadWithMonthlyBalances,
      includeCredits,
      includeDebits,
    } = this.state;

    if (!accountHeadWithMonthlyBalances) return null;

    const accountHeadsForList = [accountHeadWithMonthlyBalances].concat(
      this.getChildAccountHeads(accountHeadWithMonthlyBalances)
    );
    const accountHeadIds = accountHeadsForList.map(
      _aacountHead => _aacountHead._id
    );

    return (
      <VoucherDetailsList
        companyId={accountHeadWithMonthlyBalances.companyId}
        accountHeadIds={accountHeadIds}
        startDate={month.clone().startOf('month')}
        endDate={month.clone().endOf('month')}
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
      'accountHeadId'
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

    const treeDataSource = treeify(accountHeadsWithBalances);

    return (
      <>
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
        >
          {this.getVoucherDetailsList()}
        </Drawer>
      </>
    );
  }
}

export default flowRight(
  WithAccountHeadsByCompany(),
  WithAccountMonthlyBalancesByCompany()
)(List);
