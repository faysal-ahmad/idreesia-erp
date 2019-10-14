import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from '/imports/ui/controls';
import {
  WithAllDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    createAttendances: PropTypes.func,
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

  handleCreateMissingAttendances = () => {
    const { createAttendances } = this.props;
    createAttendances({
      variables: {
        month: this.state.selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(({ data }) => {
        message.success(
          `${data.createAttendances} missing attendance records have been created.`,
          5
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleViewCards = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsMeetingCardsPath}?barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  handleDeleteAttendance = selectedAttendances => {
    if (!selectedAttendances || selectedAttendances.length === 0) return;

    const { deleteAttendances } = this.props;
    const ids = selectedAttendances.map(({ _id }) => _id);
    deleteAttendances({
      variables: {
        ids,
      },
    })
      .then(() => {
        message.success('Selected attendance records have been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleItemSelected = karkun => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
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
        handleCreateMissingAttendances={this.handleCreateMissingAttendances}
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

const createMutation = gql`
  mutation createAttendances($month: String!) {
    createAttendances(month: $month)
  }
`;

const deleteMutation = gql`
  mutation deleteAttendances($ids: [String]!) {
    deleteAttendances(ids: $ids)
  }
`;

export default flowRight(
  graphql(createMutation, {
    name: 'createAttendances',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  graphql(deleteMutation, {
    name: 'deleteAttendances',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'List'])
)(ListContainer);
