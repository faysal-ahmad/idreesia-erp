import React, { Component } from "react";
import PropTypes from "prop-types";

import List from "./list";

export default class ListContainer extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    accountHeadIds: PropTypes.array,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    includeCredits: PropTypes.bool,
    includeDebits: PropTypes.bool,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { pageIndex, pageSize } = this.state;
    const {
      companyId,
      accountHeadIds,
      startDate,
      endDate,
      includeCredits,
      includeDebits,
    } = this.props;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        companyId={companyId}
        accountHeadIds={accountHeadIds}
        startDate={startDate}
        endDate={endDate}
        includeCredits={includeCredits}
        includeDebits={includeDebits}
        setPageParams={this.setPageParams}
      />
    );
  }
}
