import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Modal, message } from '/imports/ui/controls';
import { WithAllJobs } from '/imports/ui/modules/hr/common/composers';
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

class ListContainer extends Component {
  static propTypes = {
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    createSalaries: PropTypes.func,
    updateSalary: PropTypes.func,
    approveSalaries: PropTypes.func,
    approveAllSalaries: PropTypes.func,
    deleteSalaries: PropTypes.func,
    deleteAllSalaries: PropTypes.func,

    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    showEditForm: false,
    salary: null,
  };

  setPageParams = newParams => {
    const { queryParams, history, location } = this.props;
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

  handleEditSalary = salary => {
    this.setState({
      showEditForm: true,
      salary,
    });
  };

  handleEditSalaryCancel = () => {
    this.setState({
      showEditForm: false,
      salary: null,
    });
  };

  handleEditSalarySave = ({
    _id,
    salary,
    openingLoan,
    loanDeduction,
    newLoan,
    otherDeduction,
    arrears,
    rashanMadad,
  }) => {
    const { updateSalary } = this.props;
    this.setState({
      showEditForm: false,
      salary: null,
    });

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

  handleViewSalaryReceipts = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsSalaryReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  handleViewRashanReceipts = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsRashanReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  handleViewEidReceipts = selectedRows => {
    if (!selectedRows || selectedRows.length === 0) return;

    const { history } = this.props;
    const ids = selectedRows.map(row => row._id);
    const idsString = ids.join(',');
    const path = `${paths.salarySheetsEidReceiptsPath}?ids=${idsString}`;
    history.push(path);
  };

  handleCreateMissingSalaries = () => {
    const {
      createSalaries,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? `01-${selectedMonth}`
      : moment().format(Formats.DATE_FORMAT);

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

  handleApproveSelectedSalaries = selectedSalaries => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const {
      approveSalaries,
      queryParams: { selectedMonth },
    } = this.props;
    const ids = selectedSalaries.map(({ _id }) => _id);

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

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

  handleApproveAllSalaries = () => {
    const {
      approveAllSalaries,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

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

  handleDeleteSelectedSalaries = selectedSalaries => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const {
      deleteSalaries,
      queryParams: { selectedMonth },
    } = this.props;
    const ids = selectedSalaries.map(({ _id }) => _id);

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

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

  handleDeleteAllSalaries = () => {
    const {
      deleteAllSalaries,
      queryParams: { selectedMonth },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

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

  handleItemSelected = karkun => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  render() {
    const { allJobs, allJobsLoading } = this.props;
    if (allJobsLoading) return null;

    const {
      queryParams: { selectedMonth, selectedJobId },
    } = this.props;

    const _selectedMonth = selectedMonth
      ? moment(`01-${selectedMonth}`, Formats.DATE_FORMAT)
      : moment();

    return (
      <>
        <List
          selectedJobId={selectedJobId}
          selectedMonth={_selectedMonth}
          setPageParams={this.setPageParams}
          handleEditSalary={this.handleEditSalary}
          handleViewSalaryReceipts={this.handleViewSalaryReceipts}
          handleViewRashanReceipts={this.handleViewRashanReceipts}
          handleViewEidReceipts={this.handleViewEidReceipts}
          handleCreateMissingSalaries={this.handleCreateMissingSalaries}
          handleApproveSelectedSalaries={this.handleApproveSelectedSalaries}
          handleApproveAllSalaries={this.handleApproveAllSalaries}
          handleDeleteSelectedSalaries={this.handleDeleteSelectedSalaries}
          handleDeleteAllSalaries={this.handleDeleteAllSalaries}
          handleItemSelected={this.handleItemSelected}
          allJobs={allJobs}
        />
        <Modal
          title="Update Salary"
          visible={this.state.showEditForm}
          onCancel={this.handleEditSalaryCancel}
          width={520}
          footer={null}
        >
          {this.state.showEditForm ? (
            <EditForm
              salary={this.state.salary}
              handleSave={this.handleEditSalarySave}
              handleCancel={this.handleEditSalaryCancel}
            />
          ) : null}
        </Modal>
      </>
    );
  }
}

export default flowRight(
  graphql(CREATE_SALARIES, {
    name: 'createSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(UPDATE_SALARY, {
    name: 'updateSalary',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(APPROVE_SALARIES, {
    name: 'approveSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(APPROVE_ALL_SALARIES, {
    name: 'approveAllSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(DELETE_SALARIES, {
    name: 'deleteSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(DELETE_ALL_SALARIES, {
    name: 'deleteAllSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  WithQueryParams(),
  WithAllJobs(),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'List'])
)(ListContainer);
