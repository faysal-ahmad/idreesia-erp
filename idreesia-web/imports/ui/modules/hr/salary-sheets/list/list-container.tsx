import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';
import { type Location } from 'history';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  AllJobsQuery,
  CreateSalariesMutation,
  CurrentMonthSalariesQuery,
  UpdateSalaryMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Modal, message } from 'antd';
import { useAllJobs } from '/imports/ui/modules/hr/common/hooks';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List, { type SalaryListRow } from './list';
import EditForm from './edit-form';

import {
  APPROVE_SALARIES,
  APPROVE_ALL_SALARIES,
  CREATE_SALARIES,
  DELETE_ALL_SALARIES,
  DELETE_SALARIES,
  UPDATE_SALARY,
} from '../gql';

export interface SalarySheetsPageParams {
  selectedMonth?: string;
  selectedJobId?: string;
}

type SalaryRow = SalaryListRow;

type JobRow = NonNullable<
  NonNullable<AllJobsQuery['allJobs']>[number]
> & { _id: string; name: string };

type KarkunRef = { _id: string };

interface ListContainerProps {
  history: History;
  location: Location;
}

const mutationOptions = {
  refetchQueries: ['salariesByMonth'],
};

const ListContainer = ({ history, location }: ListContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['selectedMonth', 'selectedJobId'],
  });
  useBreadcrumbs(['HR', 'Salary Sheets', 'List']);

  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRow | null>(null);

  const { allJobs, allJobsLoading } = useAllJobs();

  const [createSalaries] = useMutation(CREATE_SALARIES, mutationOptions);
  const [updateSalary] = useMutation(UPDATE_SALARY, mutationOptions);
  const [approveSalaries] = useMutation(APPROVE_SALARIES, mutationOptions);
  const [approveAllSalaries] = useMutation(APPROVE_ALL_SALARIES, mutationOptions);
  const [deleteSalaries] = useMutation(DELETE_SALARIES, mutationOptions);
  const [deleteAllSalaries] = useMutation(DELETE_ALL_SALARIES, mutationOptions);

  const pageParams = queryParams as SalarySheetsPageParams;

  const setPageParams = (newParams: Partial<Omit<SalarySheetsPageParams, 'selectedMonth'>> & { selectedMonth?: Dayjs }) => {
    const { selectedJobId, selectedMonth } = newParams;

    let selectedJobIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedJobId'))
      selectedJobIdVal = selectedJobId || '';
    else selectedJobIdVal = pageParams.selectedJobId || '';

    let selectedMonthVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedMonth'))
      selectedMonthVal = selectedMonth ? selectedMonth.format('MM-YYYY') : '';
    else selectedMonthVal = pageParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedJobId=${selectedJobIdVal}`;
    history.push(path);
  };

  const handleEditSalary = (salary: SalaryRow) => {
    setShowEditForm(true);
    setSelectedSalary(salary);
  };

  const handleEditSalaryCancel = () => {
    setShowEditForm(false);
    setSelectedSalary(null);
  };

  const handleEditSalarySave = (values: UpdateSalaryMutationVariables) => {
    setShowEditForm(false);
    setSelectedSalary(null);

    updateSalary({
      variables: values,
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleViewSalaryReceipts = (selectedRows: SalaryRow[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsSalaryReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewRashanReceipts = (selectedRows: SalaryRow[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsRashanReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewEidReceipts = (selectedRows: SalaryRow[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsEidReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleCreateMissingSalaries = () => {
    const { selectedMonth } = pageParams;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : dayjs().format(Formats.DATE_FORMAT);

    createSalaries({
      variables: {
        month: _selectedMonth,
      },
    })
      .then(({ data }: { data?: CreateSalariesMutation | null }) => {
        message.success(
          `${data?.createSalaries} missing salary records have been created.`,
          5
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleApproveSelectedSalaries = (selectedSalaries: SalaryRow[]) => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const { selectedMonth } = pageParams;
    const ids = selectedSalaries.map(({ _id }) => _id);

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    approveSalaries({
      variables: {
        ids,
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success('Selected salary records have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleApproveAllSalaries = () => {
    const { selectedMonth } = pageParams;

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    approveAllSalaries({
      variables: {
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success(
          'All salary records for the month have been approved.',
          5
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteSelectedSalaries = (selectedSalaries: SalaryRow[]) => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const { selectedMonth } = pageParams;
    const ids = selectedSalaries.map(({ _id }) => _id);

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    deleteSalaries({
      variables: {
        ids,
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success('Selected salary records have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteAllSalaries = () => {
    const { selectedMonth } = pageParams;

    const _selectedMonth = selectedMonth
      ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : dayjs();

    deleteAllSalaries({
      variables: {
        month: _selectedMonth.format(Formats.DATE_FORMAT),
      },
    })
      .then(() => {
        message.success(
          'All salary records for the month have been deleted.',
          5
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleItemSelected = (karkun: KarkunRef) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allJobsLoading) return null;

  const { selectedMonth, selectedJobId } = pageParams;

  const _selectedMonth = selectedMonth
    ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();

  const jobs = (allJobs ?? []).filter((row): row is JobRow =>
    row != null && row._id != null && row.name != null
  );

  return (
    <>
      <List
        selectedJobId={selectedJobId}
        selectedMonth={_selectedMonth}
        setPageParams={setPageParams}
        handleEditSalary={handleEditSalary}
        handleViewSalaryReceipts={handleViewSalaryReceipts}
        handleViewRashanReceipts={handleViewRashanReceipts}
        handleViewEidReceipts={handleViewEidReceipts}
        handleCreateMissingSalaries={handleCreateMissingSalaries}
        handleApproveSelectedSalaries={handleApproveSelectedSalaries}
        handleApproveAllSalaries={handleApproveAllSalaries}
        handleDeleteSelectedSalaries={handleDeleteSelectedSalaries}
        handleDeleteAllSalaries={handleDeleteAllSalaries}
        handleItemSelected={handleItemSelected}
        allJobs={jobs}
      />
      {showEditForm && selectedSalary ? (
        <Modal
          title="Update Salary"
          open={showEditForm}
          onCancel={handleEditSalaryCancel}
          width={520}
          footer={null}
        >
          <EditForm
            salary={{
              _id: selectedSalary._id!,
              salary: selectedSalary.salary,
              rashanMadad: selectedSalary.rashanMadad,
              openingLoan: selectedSalary.openingLoan,
              loanDeduction: selectedSalary.loanDeduction,
              newLoan: selectedSalary.newLoan,
              otherDeduction: selectedSalary.otherDeduction,
              arrears: selectedSalary.arrears,
            }}
            handleSave={handleEditSalarySave}
            handleCancel={handleEditSalaryCancel}
          />
        </Modal>
      ) : null}
    </>
  );
};

export default ListContainer;
