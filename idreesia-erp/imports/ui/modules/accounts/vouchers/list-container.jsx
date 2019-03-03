import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";
import { Drawer } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountSubModulePaths as paths } from "/imports/ui/modules/accounts";
import {
  WithCompanyId,
  WithCompany,
} from "/imports/ui/modules/accounts/common/composers";

import List from "./list/list";
import DetailsForm from "./details-form";

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
    pageSize: 10,
    startDate: null,
    endDate: null,
    voucherNumber: null,
    showDetails: false,
    voucherIdForDetails: null,
  };

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs([company.name, "Accounts", "Vouchers", "List"]);
    }
  }

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
      voucherIdForDetails,
    } = this.state;

    return (
      <Fragment>
        <List
          pageIndex={pageIndex}
          pageSize={pageSize}
          startDate={startDate}
          endDate={endDate}
          voucherNumber={voucherNumber}
          companyId={companyId}
          setPageParams={this.setPageParams}
          handleItemSelected={this.handleItemSelected}
          showNewButton={false}
          handleNewClicked={this.handleNewClicked}
          handleViewClicked={this.handleViewClicked}
        />
        <Drawer
          title="Voucher Details"
          width={600}
          onClose={this.handleDetailsClose}
          visible={this.state.showDetails}
          style={{
            overflow: "auto",
            height: "calc(100% - 108px)",
            paddingBottom: "108px",
          }}
        >
          <DetailsForm voucherId={voucherIdForDetails} />
        </Drawer>
      </Fragment>
    );
  }
}

export default compose(
  WithCompanyId(),
  WithCompany(),
  WithBreadcrumbs(["Accounts", "Vouchers", "List"])
)(ListContainer);
