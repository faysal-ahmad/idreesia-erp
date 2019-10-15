import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
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
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const { queryParams, history, location } = this.props;
    const { selectedDutyId, selectedShiftId, selectedMonth } = newParams;

    let selectedDutyIdVal;
    if (newParams.hasOwnProperty('selectedDutyId'))
      selectedDutyIdVal = selectedDutyId || '';
    else selectedDutyIdVal = queryParams.selectedDutyId || '';

    let selectedShiftIdVal;
    if (newParams.hasOwnProperty('selectedShiftId'))
      selectedShiftIdVal = selectedShiftId || '';
    else selectedShiftIdVal = queryParams.selectedShiftId || '';

    let selectedMonthVal;
    if (newParams.hasOwnProperty('selectedMonth'))
      selectedMonthVal = selectedMonth.format('MM-YYYY');
    else selectedMonthVal = queryParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedDutyId=${selectedDutyIdVal}&selectedShiftIdVal=${selectedShiftIdVal}`;
    history.push(path);
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
    if (allDutiesLoading || allDutyShiftsLoading) return null;

    const {
      queryParams: { selectedMonth, selectedDutyId, selectedShiftId },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

    return (
      <List
        selectedDutyId={selectedDutyId}
        selectedShiftId={selectedShiftId}
        selectedMonth={_selectedMonth}
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
  WithQueryParams(),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'List'])
)(ListContainer);
