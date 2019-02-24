import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountSubModulePaths as paths } from "/imports/ui/modules/accounts";
import { WithCompanyId } from "/imports/ui/modules/accounts/common/composers";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    companyId: PropTypes.string,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
    startDate: null,
    endDate: null,
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
    // Show the voucher details
  };

  render() {
    const { companyId } = this.props;
    const { pageIndex, pageSize, startDate, endDate } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        startDate={startDate}
        endDate={endDate}
        companyId={companyId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton={false}
        handleNewClicked={this.handleNewClicked}
        handleViewClicked={this.handleViewClicked}
      />
    );
  }
}

export default compose(
  WithCompanyId(),
  WithBreadcrumbs(["Accounts", "Vouchers", "List"])
)(ListContainer);
