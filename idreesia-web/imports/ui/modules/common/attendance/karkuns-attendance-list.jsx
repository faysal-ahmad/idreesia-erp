import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { filter, noop, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Icon,
  Menu,
  Table,
} from '/imports/ui/controls';
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
    month: moment().format(Formats.MONTH_FORMAT),
    attendance: [],
  };

  state = {
    isEditing: false,
    selectedRows: [],
    updatedAttendances: {},
  };

  attendanceStyles = {
    pr: 'ant-calendar-cell attendance-date-linear attendance-present',
    la: 'ant-calendar-cell attendance-date-linear attendance-late',
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
        width: 250,
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

          const month = moment(`01-${record.month}`, Formats.DATE_FORMAT);
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
        title: 'Late',
        dataIndex: 'lateCount',
        key: 'lateCount',
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
    else if (curentVal === 'pr') newAttendanceValue = 'la';
    else if (curentVal === 'la') newAttendanceValue = 'ab';
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

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const { handleDeleteSelectedAttendances } = this.props;

    if (!selectedRows || selectedRows.length === 0) return;
    handleDeleteSelectedAttendances(selectedRows);
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

  getActionsMenu = () => {
    const { isEditing } = this.state;
    const {
      readOnly,
      handleCreateMissingAttendances,
      handleDeleteAllAttendances,
    } = this.props;

    if (readOnly) return null;

    if (isEditing) {
      return (
        <div>
          <Button icon="close-circle" onClick={this.handleCancelAttendances}>
            Cancel
          </Button>
          &nbsp;
          <Button
            type="primary"
            icon="save"
            onClick={this.handleSaveAttendances}
          >
            Save
          </Button>
        </div>
      );
    }

    const menu = (
      <Menu>
        <Menu.Item key="1" onClick={handleCreateMissingAttendances}>
          <Icon type="plus-circle" />
          Create Missing Attendances
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="6" onClick={this.handleDeleteSelected}>
          <Icon type="delete" />
          Delete Selected Attendances
        </Menu.Item>
        <Menu.Item key="7" onClick={handleDeleteAllAttendances}>
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
    const { month } = this.props;
    const _month = moment(`01-${month}`, Formats.DATE_FORMAT);
    return (
      <div className="list-table-header">
        <div className="list-table-header-section">
          {this.getCityMehfilSelector()}
          &nbsp;&nbsp;
          <Button
            type="primary"
            shape="circle"
            icon="left"
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
            icon="right"
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
