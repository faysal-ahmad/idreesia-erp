import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
import {
  flowRight,
  keyBy,
  memoize,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

import { PREV_MONTH_SALARIES, CURRENT_MONTH_SALARIES } from '../gql';

const SelectStyle = {
  width: '300px',
};

const IconStyle = {
  fontSize: '20px',
};

export class List extends Component {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedJobId: PropTypes.string,
    allJobs: PropTypes.array,

    prevSalaries: PropTypes.array,
    prevSalariesLoading: PropTypes.bool,
    currentSalaries: PropTypes.array,
    currentSalariesLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleCreateMissingSalaries: PropTypes.func,
    handleEditSalary: PropTypes.func,
    handleViewSalaryReceipts: PropTypes.func,
    handleViewRashanReceipts: PropTypes.func,
    handleApproveSelectedSalaries: PropTypes.func,
    handleApproveAllSalaries: PropTypes.func,
    handleDeleteSelectedSalaries: PropTypes.func,
    handleDeleteAllSalaries: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  getColumns = () => {
    const columns = [
      {
        key: 'approved',
        render: (text, record) => {
          if (record.approvedOn) {
            let tooltip = 'Approved';
            if (record.approver) {
              tooltip = `Approved By ${record.approver.name}`;
            }

            return (
              <Tooltip title={tooltip}>
                <Icon
                  style={IconStyle}
                  type="check-circle"
                  theme="twoTone"
                  twoToneColor="#52c41a"
                />
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Not Approved">
              <Icon
                style={IconStyle}
                type="warning"
                theme="twoTone"
                twoToneColor="orange"
              />
            </Tooltip>
          );
        },
      },
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
        render: (text, record) => {
          if (record.salary !== record.prevSalary) {
            const tooltip = `Last month Salary value was ${record.prevSalary}`;
            return (
              <Tooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
      },
      {
        title: 'Rashan',
        dataIndex: 'rashanMadad',
        key: 'rashanMadad',
        render: (text, record) => {
          if (record.rashanMadad !== record.prevRashanMadad) {
            const tooltip = `Last month Rashan value was ${record.prevRashanMadad}`;
            return (
              <Tooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
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
        render: (text, record) => {
          if (record.otherDeduction !== record.prevOtherDeduction) {
            const tooltip = `Last month Other Deduction value was ${record.prevOtherDeduction}`;
            return (
              <Tooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
      },
      {
        title: 'Arrears',
        dataIndex: 'arrears',
        key: 'arrears',
        render: (text, record) => {
          if (record.arrears !== record.prevArrears) {
            const tooltip = `Last month Arrears value was ${record.prevArrears}`;
            return (
              <Tooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
      },
      {
        title: 'Net Payment',
        dataIndex: 'netPayment',
        key: 'netPayment',
      },
    ];

    const actionsColumn = {
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
    };

    // Don't show the edit and delete actions for salaries from previous months
    const { selectedMonth } = this.props;
    const currentMonth = moment();
    if (currentMonth.diff(selectedMonth, 'months') <= 1) {
      return columns.concat(actionsColumn);
    }

    return columns;
  };

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

  handlePrintRashanReceipts = () => {
    const { handleViewRashanReceipts } = this.props;
    const { selectedRows } = this.state;
    if (handleViewRashanReceipts) {
      handleViewRashanReceipts(selectedRows);
    }
  };

  handleDownloadAsCSV = () => {
    const { currentSalaries } = this.props;
    const sortedSalariesByMonth = sortBy(currentSalaries, 'karkun.name');

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

  _handleApproveSelectedSalaries = () => {
    const { selectedRows } = this.state;
    const { handleApproveSelectedSalaries } = this.props;
    if (handleApproveSelectedSalaries) {
      handleApproveSelectedSalaries(selectedRows);
    }
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
    const {
      handleCreateMissingSalaries,
      handleApproveAllSalaries,
    } = this.props;

    // Don't show the delete and delete all options in the menu for salaries from previous months
    const { selectedMonth } = this.props;
    const currentMonth = moment();
    let showDeleteMenu = false;
    if (currentMonth.diff(selectedMonth, 'months') === 0) {
      showDeleteMenu = true;
    }

    let deleteMenuItems = [];
    if (showDeleteMenu) {
      deleteMenuItems = [
        <Menu.Divider key="divider" />,
        <Menu.Item key="6" onClick={this._handleDeleteSelectedSalaries}>
          <Icon type="delete" />
          Delete Selected Salaries
        </Menu.Item>,
        <Menu.Item key="7" onClick={this._handleDeleteAllSalaries}>
          <Icon type="delete" />
          Delete All Salaries
        </Menu.Item>,
      ];
    }

    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleCreateMissingSalaries}>
          <Icon type="plus-circle" />
          Create Missing Salaries
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2-1" onClick={this._handleApproveSelectedSalaries}>
          <Icon type="check-circle" />
          Approve Selected Salaries
        </Menu.Item>
        <Menu.Item key="2-2" onClick={handleApproveAllSalaries}>
          <Icon type="check-circle" />
          Approve All Salaries
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" onClick={this.handleDownloadAsCSV}>
          <Icon type="file-excel" />
          Download as CSV
        </Menu.Item>
        <Menu.Item key="4" onClick={this.handlePrintSalaryReceipts}>
          <Icon type="printer" />
          Print Salary Receipts
        </Menu.Item>
        <Menu.Item key="5" onClick={this.handlePrintRashanReceipts}>
          <Icon type="printer" />
          Print Rashan Receipts
        </Menu.Item>
        {deleteMenuItems}
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

  getSortedSalaries = memoize((currentSalaries, prevSalaries) => {
    const prevSalariesMap = keyBy(prevSalaries, 'karkunId');
    const sortedCurrentSalaries = sortBy(currentSalaries, 'karkun.name');
    return sortedCurrentSalaries.map(currentSalary => {
      const prevSalary = prevSalariesMap[currentSalary.karkunId];
      return Object.assign({}, currentSalary, {
        prevSalary: prevSalary ? prevSalary.salary : 0,
        prevOtherDeduction: prevSalary ? prevSalary.otherDeduction : 0,
        prevArrears: prevSalary ? prevSalary.arrears : 0,
        prevRashanMadad: prevSalary ? prevSalary.rashanMadad : 0,
      });
    });
  });

  render() {
    const { currentSalaries, prevSalaries } = this.props;
    const sortedSalariesByMonth = this.getSortedSalaries(
      currentSalaries,
      prevSalaries
    );

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns()}
        rowSelection={this.rowSelection}
        dataSource={sortedSalariesByMonth}
        pagination={false}
        bordered
      />
    );
  }
}

export default flowRight(
  graphql(PREV_MONTH_SALARIES, {
    props: ({ data }) => ({
      prevSalariesLoading: data.loading,
      prevSalaries: data.salariesByMonth,
      ...data,
    }),
    options: ({ selectedMonth, selectedJobId }) => {
      const previousMonth = selectedMonth.clone().subtract(1, 'month');
      return {
        variables: {
          month: previousMonth.format(Formats.DATE_FORMAT),
          jobId: selectedJobId,
        },
      };
    },
  }),
  graphql(CURRENT_MONTH_SALARIES, {
    props: ({ data }) => ({
      currentSalariesLoading: data.loading,
      currentSalaries: data.salariesByMonth,
      ...data,
    }),
    options: ({ selectedMonth, selectedJobId }) => ({
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        jobId: selectedJobId,
      },
    }),
  })
)(List);
