import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';
import { type Location } from 'history';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  CreateAttendancesMutation,
  CreateAttendancesMutationVariables,
  DeleteAllAttendancesMutation,
  DeleteAllAttendancesMutationVariables,
  DeleteAttendancesMutation,
  DeleteAttendancesMutationVariables,
  ImportAttendancesMutation,
  ImportAttendancesMutationVariables,
  UpdateAttendanceMutation,
  UpdateAttendanceMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Modal, message } from 'antd';
import {
  useAllJobs,
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List, {
  type AttendanceListRow,
  type ListProps,
} from './list';
import EditForm from './edit-form';

export interface AttendanceSheetsPageParams {
  selectedMonth?: string;
  selectedCategoryId?: string;
  selectedSubCategoryId?: string;
}

type AttendanceRow = AttendanceListRow;

const CREATE_ATTENDANCES: TypedDocumentNode<
  CreateAttendancesMutation,
  CreateAttendancesMutationVariables
> = gql`
  mutation createAttendances($month: String!) {
    createAttendances(month: $month)
  }
`;

const UPDATE_ATTENDANCE: TypedDocumentNode<
  UpdateAttendanceMutation,
  UpdateAttendanceMutationVariables
> = gql`
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

const DELETE_ATTENDANCES: TypedDocumentNode<
  DeleteAttendancesMutation,
  DeleteAttendancesMutationVariables
> = gql`
  mutation deleteAttendances($month: String!, $ids: [String]!) {
    deleteAttendances(month: $month, ids: $ids)
  }
`;

const DELETE_ALL_ATTENDANCES: TypedDocumentNode<
  DeleteAllAttendancesMutation,
  DeleteAllAttendancesMutationVariables
> = gql`
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

const IMPORT_ATTENDANCES: TypedDocumentNode<
  ImportAttendancesMutation,
  ImportAttendancesMutationVariables
> = gql`
  mutation importAttendances(
    $month: String!
    $dutyId: String!
    $shiftId: String
  ) {
    importAttendances(month: $month, dutyId: $dutyId, shiftId: $shiftId)
  }
`;

interface ListContainerProps {
  history: History;
  location: Location;
}

const mutationOptions = {
  refetchQueries: ['attendanceByMonth'],
};

const ListContainer = ({ history, location }: ListContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['selectedMonth', 'selectedCategoryId', 'selectedSubCategoryId'],
  });
  useBreadcrumbs(['HR', 'Attendance Sheets', 'List']);

  const [showEditForm, setShowEditForm] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRow | null>(null);

  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();

  const [createAttendances] = useMutation(CREATE_ATTENDANCES, mutationOptions);
  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE, mutationOptions);
  const [deleteAttendances] = useMutation(DELETE_ATTENDANCES, mutationOptions);
  const [deleteAllAttendances] = useMutation(DELETE_ALL_ATTENDANCES, mutationOptions);
  const [importAttendances] = useMutation(IMPORT_ATTENDANCES, mutationOptions);

  const pageParams = queryParams as AttendanceSheetsPageParams;

  const setPageParams = (
    newParams: Partial<Omit<AttendanceSheetsPageParams, 'selectedMonth'>> & {
      selectedMonth?: Dayjs;
    }
  ) => {
    const {
      selectedCategoryId,
      selectedSubCategoryId,
      selectedMonth,
    } = newParams;

    let selectedCategoryIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedCategoryId'))
      selectedCategoryIdVal = selectedCategoryId || '';
    else selectedCategoryIdVal = pageParams.selectedCategoryId || '';

    let selectedSubCategoryIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedSubCategoryId'))
      selectedSubCategoryIdVal = selectedSubCategoryId || '';
    else selectedSubCategoryIdVal = pageParams.selectedSubCategoryId || '';

    let selectedMonthVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedMonth'))
      selectedMonthVal = selectedMonth ? selectedMonth.format('MM-YYYY') : '';
    else selectedMonthVal = pageParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedCategoryId=${selectedCategoryIdVal}&selectedSubCategoryId=${selectedSubCategoryIdVal}`;
    history.push(path);
  };

  const handleEditAttendance = (selectedAttendance: AttendanceRow) => {
    setShowEditForm(true);
    setAttendance(selectedAttendance);
  };

  const handleEditAttendanceCancel = () => {
    setShowEditForm(false);
    setAttendance(null);
  };

  const handleEditAttendanceSave = (values: UpdateAttendanceMutationVariables) => {
    setShowEditForm(false);
    setAttendance(null);

    updateAttendance({
      variables: values,
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleImportFromGoogleSheet = () => {
    const { selectedMonth, selectedCategoryId, selectedSubCategoryId } = pageParams;

    if (selectedCategoryId) {
      importAttendances({
        variables: {
          month: selectedMonth || dayjs().format('MM-YYYY'),
          dutyId: selectedCategoryId,
          shiftId: selectedSubCategoryId,
        },
      }).catch((error: Error) => {
        message.error(error.message, 5);
      });
    }
  };

  const handleCreateMissingAttendances = () => {
    const { selectedMonth } = pageParams;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : dayjs().format(Formats.DATE_FORMAT);

    createAttendances({
      variables: {
        month: _selectedMonth,
      },
    })
      .then(({ data }: { data?: CreateAttendancesMutation | null }) => {
        message.success(
          `${data?.createAttendances} missing attendance records have been created.`,
          5
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleViewMeetingCards = (selectedRows: AttendanceRow[], cardType: string) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsMeetingCardsPath}?cardType=${cardType}&barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  const handleViewKarkunCards = (selectedRows: AttendanceRow[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const barcodeIds = selectedRows.map(row => row.meetingCardBarcodeId);
    const barcodeIdsString = barcodeIds.join(',');
    const path = `${paths.attendanceSheetsKarkunCardsPath}?barcodeIds=${barcodeIdsString}`;
    history.push(path);
  };

  const handlePrintKarkunsList = (selectedRows: AttendanceRow[]) => {
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
    } = pageParams;

    const path = `${paths.attendanceSheetsPrintAttendanceSheetPath}?selectedMonth=${selectedMonth}&selectedCategoryId=${selectedCategoryId}&selectedSubCategoryId=${selectedSubCategoryId}`;
    history.push(path);
  };

  const handleDeleteSelectedAttendances = (selectedAttendances: AttendanceRow[]) => {
    if (!selectedAttendances || selectedAttendances.length === 0) return;

    const { selectedMonth } = pageParams;

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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteAllAttendances = () => {
    const { selectedMonth, selectedCategoryId, selectedSubCategoryId } = pageParams;

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
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
    }
  };

  const handleItemSelected = (karkun: { _id: string }) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading)
    return null;

  const { selectedMonth, selectedCategoryId, selectedSubCategoryId } = pageParams;

  const _selectedMonth = selectedMonth
    ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();

  const jobs = (allJobs ?? []).filter(
    row => row != null && row._id != null && row.name != null
  ) as ListProps['allJobs'];
  const msDuties = (allMSDuties ?? []).filter(
    row => row != null && row._id != null && row.name != null
  ) as ListProps['allMSDuties'];
  const dutyShifts = (allDutyShifts ?? []).filter(
    row => row != null && row._id != null && row.name != null && row.dutyId != null
  ) as ListProps['allDutyShifts'];

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
        allJobs={jobs}
        allMSDuties={msDuties}
        allDutyShifts={dutyShifts}
      />
      {showEditForm && attendance ? (
        <Modal
          title="Update Attendance"
          open={showEditForm}
          onCancel={handleEditAttendanceCancel}
          width={500}
          footer={null}
        >
          <EditForm
            attendance={{
              _id: attendance._id,
              month: attendance.month ?? undefined,
              attendanceDetails: attendance.attendanceDetails ?? undefined,
              presentCount: attendance.presentCount ?? undefined,
              absentCount: attendance.absentCount ?? undefined,
              percentage: attendance.percentage ?? undefined,
            }}
            handleSave={handleEditAttendanceSave}
            handleCancel={handleEditAttendanceCancel}
          />
        </Modal>
      ) : null}
    </>
  );
};

export default ListContainer;
