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

const mutationOptions = {
  refetchQueries: ['salariesByMonth'],
};

const ListContainer = ({ history, location, queryParams }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const { allJobs, allJobsLoading } = useAllJobs();

  const [createSalaries] = useMutation(CREATE_SALARIES, mutationOptions);
  const [updateSalary] = useMutation(UPDATE_SALARY, mutationOptions);
  const [approveSalaries] = useMutation(APPROVE_SALARIES, mutationOptions);
  const [approveAllSalaries] = useMutation(
    APPROVE_ALL_SALARIES,
    mutationOptions
  );
  const [deleteSalaries] = useMutation(DELETE_SALARIES, mutationOptions);
  const [deleteAllSalaries] = useMutation(
    DELETE_ALL_SALARIES,
    mutationOptions
  );

  const setPageParams = newParams => {
    const { selectedJobId, selectedMonth } = newParams;

    let selectedJobIdVal;
    if (newParams.hasOwnProperty('selectedJobId'))
      selectedJobIdVal = selectedJobId || '';
    else selectedJobIdVal = queryParams.selectedJobId || '';

    let selectedMonthVal;
    if (newParams.hasOwnProperty('selectedMonth'))
      selectedMonthVal = selectedMonth.format('MM-YYYY');
    else selectedMonthVal = queryParams.selectedMonth || '';

    const path = `${location.pathname}?selectedMonth=${selectedMonthVal}&selectedJobId=${selectedJobIdVal}`;
    history.push(path);
  };

  const handleEditSalary = salary => {
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
  }) => {
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
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleViewSalaryReceipts = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsSalaryReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewRashanReceipts = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsRashanReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  const handleViewEidReceipts = selectedRows => {
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
      .then(({ data }) => {
        message.success(
          `${data.createSalaries} missing salary records have been created.`,
          5
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleApproveSelectedSalaries = selectedSalaries => {
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
      .catch(error => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleDeleteSelectedSalaries = selectedSalaries => {
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
      .catch(error => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleItemSelected = karkun => {
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  if (allJobsLoading) return null;

  const { selectedMonth, selectedJobId } = queryParams;

  const _selectedMonth = selectedMonth
    ? dayjs(`01-${selectedMonth}`, Formats.DATE_FORMAT)
    : dayjs();

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
        allJobs={allJobs}
      />
      {showEditForm ? (
        <Modal
          title="Update Salary"
          open={showEditForm}
          onCancel={handleEditSalaryCancel}
          width={520}
          footer={null}
        >
          <EditForm
            salary={selectedSalary}
            handleSave={handleEditSalarySave}
            handleCancel={handleEditSalaryCancel}
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

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'List'])
)(ListContainer);
