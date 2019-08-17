import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { message } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import {
  WithAllDuties,
  WithAllDutyShifts,
} from "/imports/ui/modules/hr/common/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    deleteAttendances: PropTypes.func,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    selectedMonth: moment(),
    selectedDutyId: null,
    selectedShiftId: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewAttendance = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsNewFormPath);
  };

  handleEditAttendance = attendance => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsEditFormPath(attendance._id));
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

  handleDeleteAttendance = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { deleteAttendances } = this.props;
    const ids = selectedRows.map(({ _id }) => _id);
    deleteAttendances({
      variables: {
        ids,
      },
    })
      .then(() => {
        message.success("Selected attendance records have been deleted.", 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleItemSelected = attendance => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${attendance.karkunId}`);
  };

  render() {
    const {
      allDuties,
      allDutyShifts,
      allDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    const { selectedMonth, selectedDutyId, selectedShiftId } = this.state;
    if (allDutiesLoading || allDutyShiftsLoading) return null;

    return (
      <List
        selectedDutyId={selectedDutyId}
        selectedShiftId={selectedShiftId}
        selectedMonth={selectedMonth}
        setPageParams={this.setPageParams}
        handleNewAttendance={this.handleNewAttendance}
        handleEditAttendance={this.handleEditAttendance}
        handleUploadAttendanceSheet={this.handleUploadAttendanceSheet}
        handleViewCards={this.handleViewCards}
        handleDeleteAttendance={this.handleDeleteAttendance}
        handleItemSelected={this.handleItemSelected}
        allDuties={allDuties}
        allDutyShifts={allDutyShifts}
      />
    );
  }
}

const formMutation = gql`
  mutation deleteAttendances($ids: [String]!) {
    deleteAttendances(ids: $ids)
  }
`;

export default compose(
  graphql(formMutation, {
    name: "deleteAttendances",
    options: {
      refetchQueries: ["attendanceByMonth"],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(["HR", "Attendance Sheets", "List"])
)(ListContainer);
