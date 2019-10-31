import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import FileSaver from 'file-saver';

import {
  Button,
  DatePicker,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tooltip,
} from '/imports/ui/controls';
import { flowRight, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

const SelectStyle = {
  width: '300px',
};

export class List extends Component {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedJobId: PropTypes.string,
    allJobs: PropTypes.array,

    salariesByMonth: PropTypes.array,
    salariesLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleCreateMissingSalaries: PropTypes.func,
    handleEditSalary: PropTypes.func,
    handleViewSalaryReceipts: PropTypes.func,
    handleDeleteSelectedSalaries: PropTypes.func,
    handleDeleteAllSalaries: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => (
        <KarkunName
          karkun={record.karkun}
          onKarkunNameClicked={this.props.handleItemSelected}
        />
      ),
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: 'Loan',
      children: [
        {
          title: 'Opening',
          dataIndex: 'openingLoan',
          key: 'openingLoan',
        },
        {
          title: 'Deduction',
          dataIndex: 'loanDeduction',
          key: 'loanDeduction',
        },
        {
          title: 'New',
          dataIndex: 'newLoan',
          key: 'newLoan',
        },
        {
          title: 'Closing',
          dataIndex: 'closingLoan',
          key: 'closingLoan',
        },
      ],
    },
    {
      title: 'Other Deduction',
      dataIndex: 'otherDeduction',
      key: 'otherDeduction',
    },
    {
      title: 'Arrears',
      dataIndex: 'arrears',
      key: 'arrears',
    },
    {
      title: 'Net Payment',
      dataIndex: 'netPayment',
      key: 'netPayment',
    },
    {
      key: 'action',
      render: (text, record) => {
        const { handleEditSalary, handleDeleteSelectedSalaries } = this.props;
        return (
          <div className="list-actions-column">
            <Tooltip title="Edit">
              <Icon
                type="edit"
                className="list-actions-icon"
                onClick={() => {
                  handleEditSalary(record);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this salary record?"
              onConfirm={() => {
                handleDeleteSelectedSalaries([record]);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Icon type="delete" className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleMonthChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedMonth: value,
    });
  };

  handleMonthGoBack = () => {
    const { selectedMonth, setPageParams } = this.props;
    setPageParams({
      selectedMonth: selectedMonth.clone().subtract(1, 'months'),
    });
  };

  handleMonthGoForward = () => {
    const { selectedMonth, setPageParams } = this.props;
    setPageParams({
      selectedMonth: selectedMonth.clone().add(1, 'months'),
    });
  };

  handleSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedJobId: value,
    });
  };

  handlePrintSalaryReceipts = () => {
    const { handleViewSalaryReceipts } = this.props;
    const { selectedRows } = this.state;
    if (handleViewSalaryReceipts) {
      handleViewSalaryReceipts(selectedRows);
    }
  };

  handleDownloadAsCSV = () => {
    const { salariesByMonth } = this.props;
    const sortedSalariesByMonth = sortBy(salariesByMonth, 'karkun.name');

    const header =
      'Name, S/O, CNIC, Phone No., Dept, Salary, Opening Loan, Loan Deduction, New Loan, Closing Loan, Other Deduction, Arrears, Net Payment \r\n';
    const rows = sortedSalariesByMonth.map(
      salary =>
        `${salary.karkun.name}, ${salary.karkun.parentName}, ${salary.karkun.cnicNumber}, ${salary.karkun.contactNumber1}, ${salary.job.name}, ${salary.salary}, ${salary.openingLoan}, ${salary.loanDeduction}, ${salary.newLoan}, ${salary.closingLoan}, ${salary.otherDeduction}, ${salary.arrears}, ${salary.netPayment}`
    );
    const csvContent = `${header}${rows.join('\r\n')}`;

    const blob = new Blob([csvContent], {
      type: 'data:text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'salary-sheet.csv');
  };

  _handleDeleteSelectedSalaries = () => {
    const { selectedRows } = this.state;
    const { handleDeleteSelectedSalaries } = this.props;
    if (handleDeleteSelectedSalaries) {
      Modal.confirm({
        title: 'Delete Salaries',
        content: 'Are you sure you want to delete the selected salary records?',
        onOk() {
          handleDeleteSelectedSalaries(selectedRows);
        },
      });
    }
  };

  _handleDeleteAllSalaries = () => {
    const { handleDeleteAllSalaries } = this.props;
    if (handleDeleteAllSalaries) {
      Modal.confirm({
        title: 'Delete All Salaries',
        content:
          'Are you sure you want to delete all salary records for the month?',
        onOk() {
          handleDeleteAllSalaries();
        },
      });
    }
  };

  getJobSelector = () => {
    const { selectedJobId, allJobs } = this.props;

    const options = allJobs.map(job => (
      <Select.Option key={job._id} value={job._id}>
        {job.name}
      </Select.Option>
    ));

    return (
      <Select
        defaultValue={selectedJobId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </Select>
    );
  };

  getActionsMenu = () => {
    const { handleCreateMissingSalaries } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleCreateMissingSalaries}>
          <Icon type="plus-circle" />
          Create Missing Salaries
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2" onClick={this.handleDownloadAsCSV}>
          <Icon type="file-excel" />
          Download as CSV
        </Menu.Item>
        <Menu.Item key="3" onClick={this.handlePrintSalaryReceipts}>
          <Icon type="printer" />
          Print Salary Receipts
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="4" onClick={this._handleDeleteSelectedSalaries}>
          <Icon type="delete" />
          Delete Selected Salaries
        </Menu.Item>
        <Menu.Item key="5" onClick={this._handleDeleteAllSalaries}>
          <Icon type="delete" />
          Delete All Salaries
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <Button icon="setting">Actions</Button>
      </Dropdown>
    );
  };

  getTableHeader = () => {
    const { selectedMonth } = this.props;
    return (
      <div className="list-table-header">
        <div className="list-table-header-section">
          {this.getJobSelector()}
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon="left"
            onClick={this.handleMonthGoBack}
          />
          &nbsp;&nbsp;
          <DatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={selectedMonth}
          />
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon="right"
            onClick={this.handleMonthGoForward}
          />
        </div>
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  render() {
    const { salariesByMonth } = this.props;
    const sortedSalariesByMonth = sortBy(salariesByMonth, 'karkun.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={sortedSalariesByMonth}
        pagination={false}
        bordered
      />
    );
  }
}

const salariesByMonthQuery = gql`
  query salariesByMonth($month: String!, $jobId: String) {
    salariesByMonth(month: $month, jobId: $jobId) {
      _id
      karkunId
      month
      jobId
      salary
      openingLoan
      loanDeduction
      newLoan
      closingLoan
      otherDeduction
      arrears
      netPayment
      karkun {
        _id
        name
        parentName
        imageId
        cnicNumber
        contactNumber1
      }
      job {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  graphql(salariesByMonthQuery, {
    props: ({ data }) => ({ salariesLoading: data.loading, ...data }),
    options: ({ selectedMonth, selectedJobId }) => ({
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        jobId: selectedJobId,
      },
    }),
  })
)(List);