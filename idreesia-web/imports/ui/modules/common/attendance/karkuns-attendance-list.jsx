import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Modal,
  Table,
} from 'antd';
import { 
  CloseCircleOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { filter, noop, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const AttendanceContainer = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

export default class KarkunsAttendanceList extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleKarkunSelected: PropTypes.func,
    handleCreateMissingAttendances: PropTypes.func,
    handleDeleteSelectedAttendances: PropTypes.func,
    handleDeleteAllAttendances: PropTypes.func,
    handleUpdateAttendanceDetails: PropTypes.func,

    cities: PropTypes.array,
    cityMehfils: PropTypes.array,
    month: PropTypes.string,
    cityId: PropTypes.string,
    cityMehfilId: PropTypes.string,
    attendance: PropTypes.array,
  };

  static defaultProps = {
    reaOnly: false,
    setPageParams: noop,
    handleKarkunSelected: noop,
    handleCreateMissingAttendances: noop,
    handleDeleteSelectedAttendances: noop,
    handleDeleteAllAttendances: noop,
    handleUpdateAttendanceDetails: noop,

    cities: [],
    cityMehfils: [],
    month: dayjs().format(Formats.MONTH_FORMAT),
    attendance: [],
  };

  state = {
    isEditing: false,
    selectedRows: [],
    updatedAttendances: {},
  };

  attendanceStyles = {
    pr: 'ant-calendar-cell attendance-date-linear attendance-present',
    ab: 'ant-calendar-cell attendance-date-linear attendance-absent',
    none: 'ant-calendar-cell attendance-date-linear attendance-none',
  };

  getAttendanceStyle = val => {
    if (!val) return this.attendanceStyles.none;
    return this.attendanceStyles[val];
  };

  getColumns = () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'karkun.name',
        key: 'karkun.name',
        fixed: 'left',
        width: 220,
        render: (text, record) => {
          const { handleKarkunSelected } = this.props;
          return (
            <PersonName
              person={record.karkun}
              onPersonNameClicked={() => {
                handleKarkunSelected(record);
              }}
            />
          );
        },
      },
      {
        title: 'Attendance Details',
        dataIndex: 'attendanceDetails',
        key: 'attendanceDetails',
        width: 1100,
        render: (text, record) => {
          const { readOnly } = this.props;
          const { updatedAttendances } = this.state;
          let attendanceDetails = updatedAttendances[record._id];
          if (!attendanceDetails) {
            attendanceDetails = text ? JSON.parse(text) : {};
          }

          const month = dayjs(`01-${record.month}`, Formats.DATE_FORMAT);
          const days = [];
          for (let d = 1; d <= month.daysInMonth(); d++) {
            const day = d.toString();
            const val = attendanceDetails[day];
            days.push(
              <div
                key={day}
                className={this.getAttendanceStyle(val)}
                onClick={() => {
                  if (!readOnly) {
                    this.handleAttendanceDetailClicked(
                      record,
                      attendanceDetails,
                      day,
                      val
                    );
                  }
                }}
              >
                {day}
              </div>
            );
          }

          return <div style={AttendanceContainer}>{days}</div>;
        },
      },
      {
        title: 'Present',
        dataIndex: 'presentCount',
        key: 'presentCount',
        fixed: 'right',
        width: 70,
        render: text => text || '0',
      },
      {
        title: 'Absent',
        dataIndex: 'absentCount',
        key: 'absentCount',
        fixed: 'right',
        width: 70,
        render: text => text || '0',
      },
      {
        title: '%age',
        dataIndex: 'percentage',
        key: 'percentage',
        fixed: 'right',
        width: 70,
        render: text => `${text}%`,
      },
    ];

    return columns;
  };

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleAttendanceDetailClicked = (
    record,
    attendanceDetails,
    day,
    curentVal
  ) => {
    let newAttendanceValue;
    if (!curentVal) newAttendanceValue = 'pr';
    else if (curentVal === 'pr') newAttendanceValue = 'ab';
    else if (curentVal === 'ab') newAttendanceValue = null;

    const updatedAttendanceDetails = Object.assign({}, attendanceDetails, {
      [day]: newAttendanceValue,
    });

    const { updatedAttendances } = this.state;
    updatedAttendances[record._id] = updatedAttendanceDetails;
    this.setState({
      isEditing: true,
      updatedAttendances,
    });
  };

  handleSelectionChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      cityId: value[0],
      cityMehfilId: value[1],
    });
  };

  handleMonthChange = value => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value.format(Formats.MONTH_FORMAT),
    });
  };

  handleMonthGoBack = value => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value
        .clone()
        .subtract(1, 'months')
        .format(Formats.MONTH_FORMAT),
    });
  };

  handleMonthGoForward = value => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value
        .clone()
        .add(1, 'months')
        .format(Formats.MONTH_FORMAT),
    });
  };

  handleSaveAttendances = () => {
    const { updatedAttendances } = this.state;
    const { handleUpdateAttendanceDetails } = this.props;
    handleUpdateAttendanceDetails(updatedAttendances);
    this.setState({
      isEditing: false,
      updatedAttendances: {},
    });
  };

  handleCancelAttendances = () => {
    this.setState({
      isEditing: false,
      updatedAttendances: {},
    });
  };

  getCityMehfilSelector = () => {
    const { cityId, cityMehfilId, cities, cityMehfils } = this.props;
    const citiesData = cities.map(city => {
      const mehfils = filter(
        cityMehfils,
        cityMehfil => cityMehfil.cityId === city._id
      );
      const dataItem = {
        label: city.name,
        value: city._id,
        children: mehfils.map(mehfil => ({
          value: mehfil._id,
          label: mehfil.name,
        })),
      };

      return dataItem;
    });

    return (
      <Cascader
        style={{ width: '300px' }}
        onChange={this.handleSelectionChange}
        defaultValue={[cityId, cityMehfilId]}
        options={citiesData}
        expandTrigger="hover"
        changeOnSelect
      />
    );
  };

  handleAction = ({ key }) => {
    const {
      handleDeleteAllAttendances,
      handleDeleteSelectedAttendances,
    } = this.props;
    
    if (key === 'delete-selected') {
      const { selectedRows } = this.state;
      if (selectedRows.length === 0) return;
      Modal.confirm({
        title: 'Delete Selected Attendances',
        content:
          'Are you sure you want to delete the selected attendances?',
        onOk: () => {
          handleDeleteSelectedAttendances(selectedRows);
        },
      });
    } else if (key === 'delete-all') {
      Modal.confirm({
        title: 'Delete All Attendances',
        content:
          'Are you sure you want to delete all attendances for this month?',
        onOk: () => {
          handleDeleteAllAttendances();
        },
      });
    }
  }

  getActionsMenu = () => {
    const { isEditing } = this.state;
    const { readOnly } = this.props;

    if (readOnly) return null;
    if (isEditing) {
      return (
        <div>
          <Button icon={<CloseCircleOutlined />} onClick={this.handleCancelAttendances}>
            Cancel
          </Button>
          &nbsp;
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={this.handleSaveAttendances}
          >
            Save
          </Button>
        </div>
      );
    }

    const items = [
      {
        key: 'delete-selected',
        label: 'Delete Selected Attendances',
        icon: <DeleteOutlined />,
      },
      {
        key: 'delete-all',
        label: 'Delete All Attendances',
        icon: <DeleteOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: this.handleAction }}>
        <Button icon={<SettingOutlined />}>Actions</Button>
      </Dropdown>
    );
  };

  getTableHeader = () => {
    const { month } = this.props;
    const _month = dayjs(`01-${month}`, Formats.DATE_FORMAT);
    return (
      <div className="list-table-header">
        <div className="list-table-header-section">
          {this.getCityMehfilSelector()}
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => {
              this.handleMonthGoBack(_month);
            }}
          />
          &nbsp;&nbsp;
          <DatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={_month}
          />
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => {
              this.handleMonthGoForward(_month);
            }}
          />
        </div>
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  sortedAttendance = attendance => sortBy(attendance, 'karkun.name');

  render() {
    const { attendance, readOnly } = this.props;

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns()}
        rowSelection={readOnly ? null : this.rowSelection}
        dataSource={this.sortedAttendance(attendance)}
        pagination={false}
        scroll={{ x: 1000 }}
        bordered
      />
    );
  }
}
