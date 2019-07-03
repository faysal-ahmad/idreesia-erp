import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";
import { toSafeInteger } from "lodash";

import { Formats } from "meteor/idreesia-common/constants";
import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const {
      approvalStatus,
      startDate,
      endDate,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history } = this.props;

    let showApprovedVal;
    let showUnapprovedVal;
    if (newParams.hasOwnProperty("approvalStatus")) {
      showApprovedVal =
        approvalStatus.indexOf("approved") !== -1 ? "true" : "false";
      showUnapprovedVal =
        approvalStatus.indexOf("unapproved") !== -1 ? "true" : "false";
    } else {
      showApprovedVal = queryParams.showApproved || "true";
      showUnapprovedVal = queryParams.showUnapproved || "true";
    }

    let startDateVal;
    if (newParams.hasOwnProperty("startDate"))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : "";
    else startDateVal = queryParams.startDateVal || "";

    let endDateVal;
    if (newParams.hasOwnProperty("endDate"))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : "";
    else endDateVal = queryParams.endDateVal || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${
      location.pathname
    }?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleItemSelected = visitor => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  render() {
    const { queryString, queryParams } = this.props;
    const { pageIndex, pageSize } = queryParams;
    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <List
        queryString={queryString}
        queryParams={queryParams || {}}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
      />
    );
  }
}

export default compose(
  WithQueryParams(),
  WithBreadcrumbs(["Security", "Visitor's Stay Report"])
)(ListContainer);
