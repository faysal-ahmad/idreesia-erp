import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import FileSaver from 'file-saver';

import {
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Popconfirm,
  Table,
  Tooltip,
} from '/imports/ui/controls';
import {
  filter,
  flowRight,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { CardTypes } from 'meteor/idreesia-common/constants/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

const CascaderStyle = {
  width: '300px',
};

export class List extends Component {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedCategoryId: PropTypes.string,
    selectedSubCategoryId: PropTypes.string,
    allJobs: PropTypes.array,
    allDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,

    attendanceByMonth: PropTypes.array,
    attendanceLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleCreateMissingAttendances: PropTypes.func,
    handleEditAttendance: PropTypes.func,
    handleUploadAttendanceSheet: PropTypes.func,
    handleImportFromGoogleSheet: PropTypes.func,
    handleViewCards: PropTypes.func,
    handleDeleteSelectedAttendances: PropTypes.func,
    handleDeleteAllAttendances: PropTypes.func,
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
      title: 'Job / Duty / Shift',
      key: 'shift.name',
      render: (text, record) => {
        let name;
        if (record.job) {
          name = record.job.name;
        } else {
          name = record.duty.name;
          if (record.shift) {
            name = `${name} - ${record.shift.name}`;
          }
        }

        return name;
      },
    },
    {
      title: 'Present',
      dataIndex: 'presentCount',
      key: 'presentCount',
      render: text => text || '0',
    },
    {
      title: 'Late',
      dataIndex: 'lateCount',
      key: 'lateCount',
      render: text => text || '0',
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
      render: text => text || '0',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: text => `${text}%`,
    },
    {
      key: 'action',
      render: (text, record) => {
        const {
          handleEditAttendance,
          handleDeleteSelectedAttendances,
        } = this.props;
        return (
          <div className="list-actions-column">
            <Tooltip key="edit" title="Edit">
              <Icon
                type="edit"
                className="list-actions-icon"
                onClick={() => {
                  handleEditAttendance(record);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this attendance record?"
              onConfirm={() => {
                handleDeleteSelectedAttendances([record]);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip key="delete" title="Delete">
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
      selectedCategoryId: value[0],
      selectedSubCategoryId: value[1],
    });
  };

  handleViewCards = cardType => {
    const { handleViewCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewCards) {
      handleViewCards(selectedRows, cardType);
    }
  };

  handleDownloadAsCSV = () => {
    const { attendanceByMonth } = this.props;
    const sortedAttendanceByMonth = sortBy(attendanceByMonth, 'karkun.name');

    const header = 'Name, CNIC, Phone No., Present, Absent, Percetage \r\n';
    const rows = sortedAttendanceByMonth.map(
      attendance =>
        `${attendance.karkun.name}, ${attendance.karkun.cnicNumber ||
          ''}, ${attendance.karkun.contactNumber1 || ''}, ${
          attendance.presentCount
        }, ${attendance.absentCount}, ${attendance.percentage}`
    );
    const csvContent = `${header}${rows.join('\r\n')}`;

    const blob = new Blob([csvContent], {
      type: 'data:text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'attendance-sheet.csv');
  };

  _handleDeleteSelectedAttendances = () => {
    const { selectedRows } = this.state;
    const { handleDeleteSelectedAttendances } = this.props;
    if (handleDeleteSelectedAttendances) {
      Modal.confirm({
        title: 'Delete Attendances',
        content:
          'Are you sure you want to delete the selected attendance records?',
        onOk() {
          handleDeleteSelectedAttendances(selectedRows);
        },
      });
    }
  };

  _handleDeleteAllAttendances = () => {
    const { handleDeleteAllAttendances } = this.props;
    if (handleDeleteAllAttendances) {
      Modal.confirm({
        title: 'Delete All Attendances',
        content:
          'Are you sure you want to delete all attendance records for the month?',
        onOk() {
          handleDeleteAllAttendances();
        },
      });
    }
  };

  getDutyShiftSelector = () => {
    const {
      selectedCategoryId,
      selectedSubCategoryId,
      allJobs,
      allDuties,
      allDutyShifts,
    } = this.props;

    const jobsItem = {
      label: 'All Jobs',
      value: 'all_jobs',
      children: allJobs.map(job => ({
        value: job._id,
        label: job.name,
      })),
    };

    const dutiesData = allDuties.map(duty => {
      const dutyShifts = filter(
        allDutyShifts,
        dutyShift => dutyShift.dutyId === duty._id
      );
      const dataItem = {
        label: duty.name,
        value: duty._id,
        children: dutyShifts.map(dutyShift => ({
          value: dutyShift._id,
          label: dutyShift.name,
        })),
      };

      return dataItem;
    });

    const data = [jobsItem].concat(dutiesData);
    return (
      <Cascader
        style={CascaderStyle}
        onChange={this.handleSelectionChange}
        defaultValue={[selectedCategoryId, selectedSubCategoryId]}
        options={data}
        expandTrigger="hover"
        changeOnSelect
      />
    );
  };

  getActionsMenu = () => {
    const {
      handleCreateMissingAttendances,
      handleUploadAttendanceSheet,
      handleImportFromGoogleSheet,
    } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleCreateMissingAttendances}>
          <Icon type="plus-circle" />
          Create Missing Attendances
        </Menu.Item>
        <Menu.Item key="2" onClick={this.handleDownloadAsCSV}>
          <Icon type="download" />
          Download as CSV
        </Menu.Item>
        <Menu.Item key="3" onClick={handleUploadAttendanceSheet}>
          <Icon type="upload" />
          Upload Attendance CSV
        </Menu.Item>
        <Menu.Item key="4" onClick={handleImportFromGoogleSheet}>
          <Icon type="import" />
          Import from Google Sheets
        </Menu.Item>
        <Menu.Divider />
        <Menu.SubMenu key="5" title="Print Cards">
          <Menu.Item
            key="5-1"
            onClick={() =>
              this.handleViewCards(CardTypes.NAAM_I_MUBARIK_MEETING)
            }
          >
            Naam-i-Mubarik Meeting
          </Menu.Item>
          <Menu.Item
            key="5-2"
            onClick={() => this.handleViewCards(CardTypes.RABI_UL_AWAL_LANGAR)}
          >
            Rabi-ul-Awal Langar Shareef
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            key="5-3"
            onClick={() => this.handleViewCards(CardTypes.SPECIAL_SECURITY)}
          >
            Special Security
          </Menu.Item>
          <Menu.Item
            key="5-4"
            onClick={() => this.handleViewCards(CardTypes.ENTRY_GATE)}
          >
            Entry Gate
          </Menu.Item>
          <Menu.Item
            key="5-5"
            onClick={() => this.handleViewCards(CardTypes.HALL_SECURITY)}
          >
            Hall Security
          </Menu.Item>
          <Menu.Item
            key="5-6"
            onClick={() => this.handleViewCards(CardTypes.INTERCOM_DUTY)}
          >
            Intercom Duty
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Divider />
        <Menu.Item key="6" onClick={this._handleDeleteSelectedAttendances}>
          <Icon type="delete" />
          Delete Selected Attendances
        </Menu.Item>
        <Menu.Item key="7" onClick={this._handleDeleteAllAttendances}>
          <Icon type="delete" />
          Delete All Attendances
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
          {this.getDutyShiftSelector()}
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
    const { attendanceByMonth } = this.props;
    const sortedAttendanceByMonth = sortBy(attendanceByMonth, 'karkun.name');

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={sortedAttendanceByMonth}
        pagination={false}
        bordered
      />
    );
  }
}

const attendanceByMonthQuery = gql`
  query attendanceByMonth(
    $month: String!
    $categoryId: String
    $subCategoryId: String
  ) {
    attendanceByMonth(
      month: $month
      categoryId: $categoryId
      subCategoryId: $subCategoryId
    ) {
      _id
      karkunId
      month
      dutyId
      shiftId
      attendanceDetails
      presentCount
      lateCount
      absentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        name
        imageId
        cnicNumber
        contactNumber1
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
      job {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  graphql(attendanceByMonthQuery, {
    props: ({ data }) => ({ attendanceLoading: data.loading, ...data }),
    options: ({
      selectedMonth,
      selectedCategoryId,
      selectedSubCategoryId,
    }) => ({
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
      },
    }),
  })
)(List);
