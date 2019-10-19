import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

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
import { Formats } from 'meteor/idreesia-common/constants';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

const ActionsStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const ToolbarSectionStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'left',
};

const SelectStyle = {
  width: '300px',
};

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
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
    handleDeleteSelectedSalaries: PropTypes.func,
    handleDeleteAllSalaries: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'karkun.name',
      key: 'karkun.name',
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
      title: 'Opening Loan',
      dataIndex: 'openingLoan',
      key: 'openingLoan',
    },
    {
      title: 'Deduction',
      dataIndex: 'deduction',
      key: 'deduction',
    },
    {
      title: 'New Loan',
      dataIndex: 'newLoan',
      key: 'newLoan',
    },
    {
      title: 'Closing Loan',
      dataIndex: 'closingLoan',
      key: 'closingLoan',
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
          <div style={ActionsStyle}>
            <Tooltip key="edit" title="Edit">
              <Icon
                type="edit"
                style={IconStyle}
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
                <Icon type="delete" style={IconStyle} />
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

  handleDeleteSelectedSelectedSalaries = () => {
    const { selectedRows } = this.state;
    if (this.props.handleDeleteSelectedSalaries) {
      Modal.confirm({
        title: 'Delete Salaries',
        content: 'Are you sure you want to delete the selected salary records?',
        onOk() {
          this.props.handleDeleteSelectedSalaries(selectedRows);
        },
      });
    }
  };

  handleDeleteAllSalaries = () => {
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
        <Menu.Item key="2" onClick={this.handleDeleteSelectedSalaries}>
          <Icon type="delete" />
          Delete Selected Salaries
        </Menu.Item>
        <Menu.Item key="3" onClick={this.handleDeleteAllSalaries}>
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
      <div style={ToolbarStyle}>
        <div style={ToolbarSectionStyle}>
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

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={salariesByMonth}
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
      deduction
      newLoan
      closingLoan
      netPayment
      karkun {
        _id
        name
        imageId
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
