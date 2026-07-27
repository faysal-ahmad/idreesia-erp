import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useMutation } from '@apollo/client/react';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Modal, message } from 'antd';
import { useAllJobs } from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import EditForm from './edit-form';

import {
  APPROVE_SALARIES,
  APPROVE_ALL_SALARIES,
  CREATE_SALARIES,
  DELETE_ALL_SALARIES,
  DELETE_SALARIES,
  UPDATE_SALARY,
} from '../gql';

const AntModal = Modal as any;
const SalariesList = List as any;
const SalaryEditForm = EditForm as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface ListContainerProps { history: HistoryLike; location: LocationLike; queryParams: AnyRecord; }

const mutationOptions = {
  refetchQueries: ['salariesByMonth'],
};

const ListContainer = ({ history, location, queryParams }: ListContainerProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<AnyRecord | null>(null);

  const { allJobs, allJobsLoading } = useAllJobs();

  const [createSalaries] = useMutation(CREATE_SALARIES as any, mutationOptions);
  const [updateSalary] = useMutation(UPDATE_SALARY as any, mutationOptions);
  const [approveSalaries] = useMutation(APPROVE_SALARIES as any, mutationOptions);
  const [approveAllSalaries] = useMutation(
    APPROVE_ALL_SALARIES as any,
    mutationOptions
  );
  const [deleteSalaries] = useMutation(DELETE_SALARIES as any, mutationOptions);
  const [deleteAllSalaries] = useMutation(
    DELETE_ALL_SALARIES as any,
    mutationOptions
  );

  const setPageParams = (newParams: AnyRecord) => {
    const { selectedJobId, selectedMonth } = newParams;

    let selectedJobIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedJobId'))
      selectedJobIdVal = selectedJobId || '';
    else selectedJobIdVal = queryParams.selectedJobId || '';

    let selectedMonthVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'selectedMonth'))
      selectedMonthVal = selectedMonth ? selectedMonth.format('MM-YYYY') : '';
    else selectedMonthVal = queryParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedJobId=${selectedJobIdVal}`;
    history.push(path);
  };

  const handleEditSalary = (salary: AnyRecord) => {
    setShowEditForm(true);
    setSelectedSalary(salary);
  };

  const handleEditSalaryCancel = () => {
    setShowEditForm(false);
    setSelectedSalary(null);
  };

  const handleEditSalarySave = ({
    _id,
    salary,
    openingLoan,
    loanDeduction,
    newLoan,
    otherDeduction,
    arrears,
    rashanMadad,
  }: AnyRecord) => {
    setShowEditForm(false);
    setSelectedSalary(null);

    updateSalary({
      variables: {
        _id,
        salary,
        openingLoan,
        loanDeduction,
        newLoan,
        otherDeduction,
        arrears,
        rashanMadad,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleViewSalaryReceipts = (selectedRows: AnyRecord[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsSalaryReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewRashanReceipts = (selectedRows: AnyRecord[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsRashanReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewEidReceipts = (selectedRows: AnyRecord[]) => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsEidReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleCreateMissingSalaries = () => {
    const { selectedMonth } = queryParams;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : dayjs().format(Formats.DATE_FORMAT);

    createSalaries({
      variables: {
        month: _selectedMonth,
      },
    })
      .then(({ data }: AnyRecord) => {
        message.success(
          `${data.createSalaries} missing salary records have been created.`,
          5
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleApproveSelectedSalaries = (selectedSalaries: AnyRecord[]) => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const { selectedMonth } = queryParams;
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
    const { selectedMonth } = queryParams;

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

  const handleDeleteSelectedSalaries = (selectedSalaries: AnyRecord[]) => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const { selectedMonth } = queryParams;
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
    const { selectedMonth } = queryParams;

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

  const handleItemSelected = (karkun: AnyRecord) => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allJobsLoading) return null;

  const { selectedMonth, selectedJobId } = queryParams;

  const _selectedMonth = selectedMonth
    ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();

  return (
    <>
      <SalariesList
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
        allJobs={allJobs}
      />
      {showEditForm ? (
        <AntModal
          title="Update Salary"
          open={showEditForm}
          onCancel={handleEditSalaryCancel}
          width={520}
          footer={null}
        >
          <SalaryEditForm
            salary={selectedSalary}
            handleSave={handleEditSalarySave}
            handleCancel={handleEditSalaryCancel}
          />
        </AntModal>
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

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'List'])
)(ListContainer as any);
