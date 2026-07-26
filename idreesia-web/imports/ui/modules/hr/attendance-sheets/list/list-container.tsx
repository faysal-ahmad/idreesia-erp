// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Modal, message } from 'antd';
import {
  useAllJobs,
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import EditForm from './edit-form';

const mutationOptions = {
  refetchQueries: ['attendanceByMonth'],
};

const ListContainer = ({ history, location, queryParams }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [attendance, setAttendance] = useState(null);

  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();

  const [createAttendances] = useMutation(createMutation, mutationOptions);
  const [updateAttendance] = useMutation(updateMutation, mutationOptions);
  const [deleteAttendances] = useMutation(deleteMutation, mutationOptions);
  const [deleteAllAttendances] = useMutation(
    deleteAllMutation,
    mutationOptions
  );
  const [importAttendances] = useMutation(importMutation, mutationOptions);

  const setPageParams = newParams => {
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

  const handleEditAttendance = selectedAttendance => {
    setShowEditForm(true);
    setAttendance(selectedAttendance);
  };

  const handleEditAttendanceCancel = () => {
    setShowEditForm(false);
    setAttendance(null);
  };

  const handleEditAttendanceSave = values => {
    setShowEditForm(false);
    setAttendance(null);

    updateAttendance({
      variables: values,
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleImportFromGoogleSheet = () => {
    const { selectedMonth, selectedCategoryId, selectedSubCategoryId } =
      queryParams;

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

  const handleCreateMissingAttendances = () => {
    const { selectedMonth } = queryParams;

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

  const handleViewMeetingCards = (selectedRows, cardType) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsMeetingCardsPath}?cardType=${cardType}&barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  const handleViewKarkunCards = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsKarkunCardsPath}?barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  const handlePrintKarkunsList = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const karkunIds = selectedRows.map(row => row.karkunId);
    history.push(
      `${paths.karkunsPrintListPath}?karkunIds=${karkunIds.join(',')}`
    );
  };

  const handlePrintAttendanceSheet = () => {
    const {
      selectedCategoryId,
      selectedSubCategoryId,
      selectedMonth,
    } = queryParams;

    const path = `${paths.attendanceSheetsPrintAttendanceSheetPath}?selectedMonth=${selectedMonth}&selectedCategoryId=${selectedCategoryId}&selectedSubCategoryId=${selectedSubCategoryId}`;
    history.push(path);
  };

  const handleDeleteSelectedAttendances = selectedAttendances => {
    if (!selectedAttendances || selectedAttendances.length === 0) return;

    const { selectedMonth } = queryParams;

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

  const handleDeleteAllAttendances = () => {
    const { selectedMonth, selectedCategoryId, selectedSubCategoryId } =
      queryParams;

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

  const handleItemSelected = karkun => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading)
    return null;

  const { selectedMonth, selectedCategoryId, selectedSubCategoryId } =
    queryParams;

  const _selectedMonth = selectedMonth
    ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();

  return (
    <>
      <List
        selectedCategoryId={selectedCategoryId}
        selectedSubCategoryId={selectedSubCategoryId}
        selectedMonth={_selectedMonth}
        setPageParams={setPageParams}
        handleEditAttendance={handleEditAttendance}
        handleCreateMissingAttendances={handleCreateMissingAttendances}
        handleImportFromGoogleSheet={handleImportFromGoogleSheet}
        handleViewMeetingCards={handleViewMeetingCards}
        handleViewKarkunCards={handleViewKarkunCards}
        handlePrintKarkunsList={handlePrintKarkunsList}
        handlePrintAttendanceSheet={handlePrintAttendanceSheet}
        handleDeleteSelectedAttendances={handleDeleteSelectedAttendances}
        handleDeleteAllAttendances={handleDeleteAllAttendances}
        handleItemSelected={handleItemSelected}
        allJobs={allJobs}
        allMSDuties={allMSDuties}
        allDutyShifts={allDutyShifts}
      />
      {showEditForm ? (
        <Modal
          title="Update Attendance"
          open={showEditForm}
          onCancel={handleEditAttendanceCancel}
          width={500}
          footer={null}
        >
          <EditForm
            attendance={attendance}
            handleSave={handleEditAttendanceSave}
            handleCancel={handleEditAttendanceCancel}
          />
        </Modal>
      ) : null}
    </>
  );
};

ListContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryString: PropTypes.string,
  queryParams: PropTypes.object,
};

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
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'List'])
)(ListContainer);
