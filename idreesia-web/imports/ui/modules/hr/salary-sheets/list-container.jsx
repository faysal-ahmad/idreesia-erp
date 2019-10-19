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
import { WithAllJobs } from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list';
import EditForm from './edit-form';
import SalaryReceipt from './salary-receipt';

class ListContainer extends Component {
  static propTypes = {
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    createSalaries: PropTypes.func,
    updateSalary: PropTypes.func,
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
    showSalaryReceipt: false,
    salary: null,
    karkun: null,
    job: null,
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

  handleEditSalarySave = ({ _id, salary, openingLoan, deduction, newLoan }) => {
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
        deduction,
        newLoan,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleShowSalaryReceipt = (salary, karkun, job) => {
    this.setState({
      showSalaryReceipt: true,
      salary,
      karkun,
      job,
    });
  };

  handleSalaryReceiptCancel = () => {
    this.setState({
      showSalaryReceipt: false,
      salary: null,
      karkun: null,
      job: null,
    });
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

  handleDeleteSelectedSalaries = selectedSalaries => {
    if (!selectedSalaries || selectedSalaries.length === 0) return;

    const { deleteSalaries } = this.props;
    const ids = selectedSalaries.map(({ _id }) => _id);
    deleteSalaries({
      variables: {
        ids,
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
          handleShowSalaryReceipt={this.handleShowSalaryReceipt}
          handleCreateMissingSalaries={this.handleCreateMissingSalaries}
          handleDeleteSelectedSalaries={this.handleDeleteSelectedSalaries}
          handleDeleteAllSalaries={this.handleDeleteAllSalaries}
          handleItemSelected={this.handleItemSelected}
          allJobs={allJobs}
        />
        <Modal
          title="Update Salary"
          visible={this.state.showEditForm}
          onCancel={this.handleEditSalaryCancel}
          width={370}
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
        <Modal
          title="Salary Receipt"
          visible={this.state.showSalaryReceipt}
          onCancel={this.handleSalaryReceiptCancel}
          width={600}
          footer={null}
        >
          {this.state.showSalaryReceipt ? (
            <SalaryReceipt
              salary={this.state.salary}
              karkun={this.state.karkun}
              job={this.state.job}
            />
          ) : null}
        </Modal>
      </>
    );
  }
}

const createMutation = gql`
  mutation createSalaries($month: String!) {
    createSalaries(month: $month)
  }
`;

const updateMutation = gql`
  mutation updateSalary(
    $_id: String!
    $salary: Int
    $openingLoan: Int
    $deduction: Int
    $newLoan: Int
  ) {
    updateSalary(
      _id: $_id
      salary: $salary
      openingLoan: $openingLoan
      deduction: $deduction
      newLoan: $newLoan
    ) {
      _id
      karkunId
      jobId
      month
      salary
      openingLoan
      deduction
      newLoan
      closingLoan
      netPayment
    }
  }
`;

const deleteMutation = gql`
  mutation deleteSalaries($ids: [String]!) {
    deleteSalaries(ids: $ids)
  }
`;

const deleteAllMutation = gql`
  mutation deleteAllSalaries($month: String!) {
    deleteAllSalaries(month: $month)
  }
`;

export default flowRight(
  graphql(createMutation, {
    name: 'createSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(updateMutation, {
    name: 'updateSalary',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(deleteMutation, {
    name: 'deleteSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  graphql(deleteAllMutation, {
    name: 'deleteAllSalaries',
    options: {
      refetchQueries: ['salariesByMonth'],
    },
  }),
  WithQueryParams(),
  WithAllJobs(),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'List'])
)(ListContainer);
