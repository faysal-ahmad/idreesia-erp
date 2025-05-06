import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Modal, message } from 'antd';
import {
  WithAllJobs,
  WithAllMSDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import EditForm from './edit-form';

class ListContainer extends Component {
  static propTypes = {
    allMSDuties: PropTypes.array,
    allMSDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    createAttendances: PropTypes.func,
    updateAttendance: PropTypes.func,
    deleteAttendances: PropTypes.func,
    deleteAllAttendances: PropTypes.func,
    importAttendances: PropTypes.func,

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

  handleEditAttendanceSave = values => {
    const { updateAttendance } = this.props;
    this.setState({
      showEditForm: false,
      attendance: null,
    });

    updateAttendance({
      variables: values,
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleImportFromGoogleSheet = () => {
    const {
      importAttendances,
      queryParams: { selectedMonth, selectedCategoryId, selectedSubCategoryId },
    } = this.props;

    if (selectedCategoryId) {
      importAttendances({
        variables: {
          month: selectedMonth || dayjs().format('MM-YYYY'),
          dutyId: selectedCategoryId,
          shiftId: selectedSubCategoryId,
        },
      })
        .then(() => {
          // show message regarding what was imported
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  handleCreateMissingAttendances = () => {
    const {
      createAttendances,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : dayjs().format(Formats.DATE_FORMAT);

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

  handleViewMeetingCards = (selectedRows, cardType) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsMeetingCardsPath}?cardType=${cardType}&barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  handleViewKarkunCards = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsKarkunCardsPath}?barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  handlePrintKarkunsList = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const karkunIds = selectedRows.map(row => row.karkunId);
    history.push(
      `${paths.karkunsPrintListPath}?karkunIds=${karkunIds.join(',')}`
    );
  };

  handlePrintAttendanceSheet = () => {
    const { queryParams, history } = this.props;
    const {
      selectedCategoryId,
      selectedSubCategoryId,
      selectedMonth,
    } = queryParams;

    const path = `${paths.attendanceSheetsPrintAttendanceSheetPath}?selectedMonth=${selectedMonth}&selectedCategoryId=${selectedCategoryId}&selectedSubCategoryId=${selectedSubCategoryId}`;
    history.push(path);
  };

  handleDeleteSelectedAttendances = selectedAttendances => {
    if (!selectedAttendances || selectedAttendances.length === 0) return;

    const {
      deleteAttendances,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

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
      queryParams: { selectedMonth, selectedCategoryId, selectedSubCategoryId },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    if (selectedCategoryId) {
      deleteAllAttendances({
        variables: {
          month: _selectedMonth.format(Formats.DATE_FORMAT),
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId,
        },
      })
        .then(() => {
          message.success(
            'All attendance records for the selected duty/shift/job in the month have been deleted.',
            5
          );
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  handleItemSelected = karkun => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  render() {
    const {
      allJobs,
      allMSDuties,
      allDutyShifts,
      allJobsLoading,
      allMSDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading)
      return null;

    const {
      queryParams: { selectedMonth, selectedCategoryId, selectedSubCategoryId },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    return (
      <>
        <List
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          selectedMonth={_selectedMonth}
          setPageParams={this.setPageParams}
          handleEditAttendance={this.handleEditAttendance}
          handleCreateMissingAttendances={this.handleCreateMissingAttendances}
          handleImportFromGoogleSheet={this.handleImportFromGoogleSheet}
          handleViewMeetingCards={this.handleViewMeetingCards}
          handleViewKarkunCards={this.handleViewKarkunCards}
          handlePrintKarkunsList={this.handlePrintKarkunsList}
          handlePrintAttendanceSheet={this.handlePrintAttendanceSheet}
          handleDeleteSelectedAttendances={this.handleDeleteSelectedAttendances}
          handleDeleteAllAttendances={this.handleDeleteAllAttendances}
          handleItemSelected={this.handleItemSelected}
          allJobs={allJobs}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
        />
        {this.state.showEditForm ? (
          <Modal
            title="Update Attendance"
            visible={this.state.showEditForm}
            onCancel={this.handleEditAttendanceCancel}
            width={500}
            footer={null}
          >
            <EditForm
              attendance={this.state.attendance}
              handleSave={this.handleEditAttendanceSave}
              handleCancel={this.handleEditAttendanceCancel}
            />
          </Modal>
        ) : null}
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
    $attendanceDetails: String
    $presentCount: Int
    $absentCount: Int
    $percentage: Int
  ) {
    updateAttendance(
      _id: $_id
      attendanceDetails: $attendanceDetails
      presentCount: $presentCount
      absentCount: $absentCount
      percentage: $percentage
    ) {
      _id
      attendanceDetails
      presentCount
      absentCount
      percentage
    }
  }
`;

const deleteMutation = gql`
  mutation deleteAttendances($month: String!, $ids: [String]!) {
    deleteAttendances(month: $month, ids: $ids)
  }
`;

const deleteAllMutation = gql`
  mutation deleteAllAttendances(
    $month: String!
    $categoryId: String
    $subCategoryId: String
  ) {
    deleteAllAttendances(
      month: $month
      categoryId: $categoryId
      subCategoryId: $subCategoryId
    )
  }
`;

const importMutation = gql`
  mutation importAttendances(
    $month: String!
    $dutyId: String!
    $shiftId: String
  ) {
    importAttendances(month: $month, dutyId: $dutyId, shiftId: $shiftId)
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
  graphql(importMutation, {
    name: 'importAttendances',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  WithQueryParams(),
  WithAllJobs(),
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'List'])
)(ListContainer);
