import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithAllDuties } from "/imports/ui/modules/hr/common/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,

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

  handleViewCards = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(",");
    const path = `${
      paths.attendanceSheetsMeetingCardsPath
    }?barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  render() {
    const { allDuties, allDutiesLoading } = this.props;
    const { selectedMonth, selectedDutyId } = this.state;
    if (allDutiesLoading) return null;

    return (
      <List
        selectedDutyId={selectedDutyId}
        selectedMonth={selectedMonth}
        setPageParams={this.setPageParams}
        handleUploadAttendanceSheet={this.handleUploadAttendanceSheet}
        handleViewCards={this.handleViewCards}
        allDuties={allDuties}
      />
    );
  }
}

export default compose(
  WithAllDuties(),
  WithBreadcrumbs(["HR", "Attendance Sheets", "List"])
)(ListContainer);
