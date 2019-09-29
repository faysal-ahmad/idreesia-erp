import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';

import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import {
  WithCompanyId,
  WithCompany,
} from '/imports/ui/modules/accounts/common/composers';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    companyId: PropTypes.string,
    company: PropTypes.object,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    startDate: null,
    endDate: null,
    voucherNumber: null,
    showDetails: false,
    voucherIdForDetails: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history, companyId } = this.props;
    history.push(paths.vouchersNewFormPath(companyId));
  };

  handleItemSelected = voucher => {
    const { history, companyId } = this.props;
    history.push(paths.vouchersEditFormPath(companyId, voucher._id));
  };

  handleViewClicked = voucher => {
    this.setState({
      showDetails: true,
      voucherIdForDetails: voucher._id,
    });
  };

  handleDetailsClose = () => {
    this.setState({
      showDetails: false,
    });
  };

  render() {
    const { companyId } = this.props;
    const {
      pageIndex,
      pageSize,
      startDate,
      endDate,
      voucherNumber,
    } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        startDate={startDate}
        endDate={endDate}
        voucherNumber={voucherNumber}
        companyId={companyId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
        handleViewClicked={this.handleViewClicked}
      />
    );
  }
}

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  WithDynamicBreadcrumbs(({ company }) => {
    if (company) {
      return `Accounts, ${company.name}, Vouchers, List`;
    }
    return `Accounts, Vouchers, List`;
  })
)(ListContainer);
