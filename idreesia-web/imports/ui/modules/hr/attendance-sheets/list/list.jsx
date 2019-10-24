import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { filter, flowRight } from 'lodash';

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

const CascaderStyle = {
  width: '300px',
};

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
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
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
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
          <div style={ActionsStyle}>
            <Tooltip key="edit" title="Edit">
              <Icon
                type="edit"
                style={IconStyle}
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
      selectedCategoryId: value[0],
      selectedSubCategoryId: value[1],
    });
  };

  handleViewCards = () => {
    const { handleViewCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewCards) {
      handleViewCards(selectedRows);
    }
  };

  handleDeleteSelectedAttendances = () => {
    const { selectedRows } = this.state;
    if (this.props.handleDeleteSelectedAttendances) {
      Modal.confirm({
        title: 'Delete Attendances',
        content:
          'Are you sure you want to delete the selected attendance records?',
        onOk() {
          this.props.handleDeleteSelectedAttendances(selectedRows);
        },
      });
    }
  };

  handleDeleteAllAttendances = () => {
    if (this.props.handleDeleteAllAttendances) {
      Modal.confirm({
        title: 'Delete All Attendances',
        content:
          'Are you sure you want to delete all attendance records for the month?',
        onOk() {
          this.props.handleDeleteAllAttendances();
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
    } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleCreateMissingAttendances}>
          <Icon type="plus-circle" />
          Create Missing Attendances
        </Menu.Item>
        <Menu.Item key="2" onClick={handleUploadAttendanceSheet}>
          <Icon type="upload" />
          Upload Attendance
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" onClick={this.handleViewCards}>
          <Icon type="idcard" />
          Print Duty Cards
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="4" onClick={this.handleDeleteSelectedAttendances}>
          <Icon type="delete" />
          Delete Selected Attendances
        </Menu.Item>
        <Menu.Item key="5" onClick={this.handleDeleteAllAttendances}>
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
      <div style={ToolbarStyle}>
        <div style={ToolbarSectionStyle}>
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

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.columns}
        rowSelection={this.rowSelection}
        dataSource={attendanceByMonth}
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
      absentCount
      presentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        name
        imageId
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
