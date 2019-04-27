import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithAllDuties } from "/imports/ui/modules/hr/common/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    allDutiesLoading: PropTypes.bool,
    allDuties: PropTypes.array,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    selectedMonth: moment(),
    selectedDutyId: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleUploadAttendanceSheet = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsUploadFormPath);
  };

  render() {
    const { allDuties, allDutiesLoading } = this.props;
    const { selectedMonth, selectedDutyId } = this.state;
    if (allDutiesLoading) return null;

    return (
      <List
        dutyId={selectedDutyId}
        selectedMonth={selectedMonth}
        setPageParams={this.setPageParams}
        handleUploadAttendanceSheet={this.handleUploadAttendanceSheet}
        allDuties={allDuties}
      />
    );
  }
}

export default compose(
  WithAllDuties(),
  WithBreadcrumbs(["HR", "Attendance Sheets", "List"])
)(ListContainer);
