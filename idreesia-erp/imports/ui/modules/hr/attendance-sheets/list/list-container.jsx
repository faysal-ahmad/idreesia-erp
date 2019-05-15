import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { message } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithAllDuties } from "/imports/ui/modules/hr/common/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    deleteAttendances: PropTypes.func,

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
        handleDeleteAttendance={this.handleDeleteAttendance}
        allDuties={allDuties}
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
  WithBreadcrumbs(["HR", "Attendance Sheets", "List"])
)(ListContainer);
