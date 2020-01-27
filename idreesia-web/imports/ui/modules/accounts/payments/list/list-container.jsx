import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    companyId: PropTypes.string,
    location: PropTypes.object,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    name: null,
    cnicNumber: null,
    paymentType: null,
    paymentAmount: null,
    startDate: null,
    endDate: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.paymentsNewFormPath);
  };

  handleEditClicked = payment => {
    const { history } = this.props;
    history.push(paths.paymentsEditFormPath(payment._id));
  };

  handlePrintPaymentReceipts = payment => {
    const { history } = this.props;
    history.push(paths.paymentReceiptsPath(payment._id));
  };

  render() {
    const {
      pageIndex,
      pageSize,
      name,
      cnicNumber,
      paymentType,
      paymentAmount,
      startDate,
      endDate,
    } = this.state;

    const queryString = `?name=${name || ''}&cnicNumber=${cnicNumber ||
      ''}&paymentType=${paymentType || ''}&paymentAmount=${paymentAmount ||
      ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return (
      <List
        queryString={queryString}
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name}
        cnicNumber={cnicNumber}
        paymentType={paymentType}
        paymentAmount={paymentAmount}
        startDate={startDate}
        endDate={endDate}
        setPageParams={this.setPageParams}
        handleNewClicked={this.handleNewClicked}
        handleEditClicked={this.handleEditClicked}
        handlePrintPaymentReceipts={this.handlePrintPaymentReceipts}
      />
    );
  }
}

export default WithBreadcrumbs(['Accounts', 'Payments', 'List'])(ListContainer);
