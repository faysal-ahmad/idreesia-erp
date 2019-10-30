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
import { Modal, message } from '/imports/ui/controls';
import {
  WithAllJobs,
  WithAllDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import EditForm from './edit-form';

class ListContainer extends Component {
  static propTypes = {
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    createAttendances: PropTypes.func,
    updateAttendance: PropTypes.func,
    deleteAttendances: PropTypes.func,
    deleteAllAttendances: PropTypes.func,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    showEditForm: false,
    attendance: null,
  };

  setPageParams = newParams => {
    const { queryParams, history, location } = this.props;
    const {
      selectedCategoryId,
      selectedSubCategoryId,
      selectedMonth,
    } = newParams;

    let selectedCategoryIdVal;
    if (newParams.hasOwnProperty('selectedCategoryId'))
      selectedCategoryIdVal = selectedCategoryId || '';
    else selectedCategoryIdVal = queryParams.selectedCategoryId || '';

    let selectedSubCategoryIdVal;
    if (newParams.hasOwnProperty('selectedSubCategoryId'))
      selectedSubCategoryIdVal = selectedSubCategoryId || '';
    else selectedSubCategoryIdVal = queryParams.selectedSubCategoryId || '';

    let selectedMonthVal;
    if (newParams.hasOwnProperty('selectedMonth'))
      selectedMonthVal = selectedMonth.format('MM-YYYY');
    else selectedMonthVal = queryParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedCategoryId=${selectedCategoryIdVal}&selectedSubCategoryId=${selectedSubCategoryIdVal}`;
    history.push(path);
  };

  handleEditAttendance = attendance => {
    this.setState({
      showEditForm: true,
      attendance,
    });
  };

  handleEditAttendanceCancel = () => {
    this.setState({
      showEditForm: false,
      attendance: null,
    });
  };

  handleEditAttendanceSave = ({
    _id,
    totalCount,
    presentCount,
    absentCount,
  }) => {
    const { updateAttendance } = this.props;
    this.setState({
      showEditForm: false,
      attendance: null,
    });

    updateAttendance({
      variables: {
        _id,
        totalCount,
        presentCount,
        absentCount,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleUploadAttendanceSheet = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsUploadFormPath);
  };

  handleCreateMissingAttendances = () => {
    const {
      createAttendances,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : moment().format(Formats.DATE_FORMAT);

    createAttendances({
      variables: {
        month: _selectedMonth,
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

  handleDeleteSelectedAttendances = selectedAttendances => {
    if (!selectedAttendances || selectedAttendances.length === 0) return;

    const {
      deleteAttendances,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

    const ids = selectedAttendances.map(({ _id }) => _id);
    deleteAttendances({
      variables: {
        ids,
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success('Selected attendance records have been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleDeleteAllAttendances = () => {
    const {
      deleteAllAttendances,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

    deleteAllAttendances({
      variables: {
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success(
          'All attendance records for the month have been deleted.',
          5
        );
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
      allJobs,
      allDuties,
      allDutyShifts,
      allJobsLoading,
      allDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    if (allJobsLoading || allDutiesLoading || allDutyShiftsLoading) return null;

    const {
      queryParams: { selectedMonth, selectedCategoryId, selectedSubCategoryId },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

    return (
      <>
        <List
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          selectedMonth={_selectedMonth}
          setPageParams={this.setPageParams}
          handleEditAttendance={this.handleEditAttendance}
          handleCreateMissingAttendances={this.handleCreateMissingAttendances}
          handleUploadAttendanceSheet={this.handleUploadAttendanceSheet}
          handleViewCards={this.handleViewCards}
          handleDeleteSelectedAttendances={this.handleDeleteSelectedAttendances}
          handleDeleteAllAttendances={this.handleDeleteAllAttendances}
          handleItemSelected={this.handleItemSelected}
          allJobs={allJobs}
          allDuties={allDuties}
          allDutyShifts={allDutyShifts}
        />
        <Modal
          title="Update Attendance"
          visible={this.state.showEditForm}
          onCancel={this.handleEditAttendanceCancel}
          width={370}
          footer={null}
        >
          {this.state.showEditForm ? (
            <EditForm
              attendance={this.state.attendance}
              handleSave={this.handleEditAttendanceSave}
              handleCancel={this.handleEditAttendanceCancel}
            />
          ) : null}
        </Modal>
      </>
    );
  }
}

const createMutation = gql`
  mutation createAttendances($month: String!) {
    createAttendances(month: $month)
  }
`;

const updateMutation = gql`
  mutation updateAttendance(
    $_id: String!
    $totalCount: Int
    $presentCount: Int
    $absentCount: Int
  ) {
    updateAttendance(
      _id: $_id
      totalCount: $totalCount
      presentCount: $presentCount
      absentCount: $absentCount
    ) {
      _id
      totalCount
      presentCount
      absentCount
    }
  }
`;

const deleteMutation = gql`
  mutation deleteAttendances($month: String!, $ids: [String]!) {
    deleteAttendances(month: $month, ids: $ids)
  }
`;

const deleteAllMutation = gql`
  mutation deleteAllAttendances($month: String!) {
    deleteAllAttendances(month: $month)
  }
`;

export default flowRight(
  graphql(createMutation, {
    name: 'createAttendances',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  graphql(updateMutation, {
    name: 'updateAttendance',
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
  graphql(deleteAllMutation, {
    name: 'deleteAllAttendances',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  WithQueryParams(),
  WithAllJobs(),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'List'])
)(ListContainer);
