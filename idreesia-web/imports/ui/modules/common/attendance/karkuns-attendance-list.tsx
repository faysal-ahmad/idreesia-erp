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

const AntButton = Button as any;
const AntCascader = Cascader as any;
const MonthPicker = (DatePicker as any).MonthPicker;
const AntDropdown = Dropdown as any;
const AntModal = Modal as any;
const AntTable = Table as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const AntSettingOutlined = SettingOutlined as any;
const PersonNameControl = PersonName as any;
type AttendanceValue = 'pr' | 'ab' | null | undefined;
type AttendanceDetails = Record<string, AttendanceValue>;
type AnyRecord = Record<string, any>;
interface Props extends Record<string, any> { readOnly?: boolean; setPageParams(params: AnyRecord): void; handleKarkunSelected?(record: AnyRecord): void; handleCreateMissingAttendances?(): void; handleDeleteSelectedAttendances?(records: AnyRecord[]): void; handleDeleteAllAttendances?(): void; handleUpdateAttendanceDetails?(attendances: Record<string, AttendanceDetails>): void; cities?: AnyRecord[]; cityMehfils?: AnyRecord[]; month?: string; cityId?: string; cityMehfilId?: string; attendance?: AnyRecord[]; }
interface State { isEditing: boolean; selectedRows: AnyRecord[]; updatedAttendances: Record<string, AttendanceDetails>; }

export default class KarkunsAttendanceList extends Component<Props, State> {
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
    readOnly: false,
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

  state: State = {
    isEditing: false,
    selectedRows: [],
    updatedAttendances: {},
  };

  attendanceStyles = {
    pr: 'ant-calendar-cell attendance-date-linear attendance-present',
    ab: 'ant-calendar-cell attendance-date-linear attendance-absent',
    none: 'ant-calendar-cell attendance-date-linear attendance-none',
  };

  getAttendanceStyle = (val: AttendanceValue) => {
    if (!val) return this.attendanceStyles.none;
    return this.attendanceStyles[val] ?? this.attendanceStyles.none;
  };

  getColumns = () => {
    const { readOnly } = this.props;
    const columns: any[] = [
      {
        title: 'Name',
        dataIndex: 'karkun.name',
        key: 'karkun.name',
        fixed: 'left',
        width: 220,
        render: (text: string | undefined, record: AnyRecord) => {
          const { handleKarkunSelected } = this.props;
          return (
            <PersonNameControl
              person={record.karkun}
              onPersonNameClicked={() => {
                handleKarkunSelected?.(record);
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
        render: (text: string | undefined, record: AnyRecord) => {
          const { readOnly } = this.props;
          const { updatedAttendances } = this.state;
          let attendanceDetails = updatedAttendances[record._id];
          if (!attendanceDetails) {
            attendanceDetails = text ? (JSON.parse(text) as AttendanceDetails) : {};
          }

          const month = dayjs(`01-${record.month}`, Formats.DATE_FORMAT);
          const days: React.ReactNode[] = [];
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

          return <div style={AttendanceContainer as any}>{days}</div>;
        },
      },
      {
        title: 'Present',
        dataIndex: 'presentCount',
        key: 'presentCount',
        fixed: 'right',
        width: 70,
        render: (text: string | number) => text || '0',
      },
      {
        title: 'Absent',
        dataIndex: 'absentCount',
        key: 'absentCount',
        fixed: 'right',
        width: 70,
        render: (text: string | number) => text || '0',
      },
      {
        title: '%age',
        dataIndex: 'percentage',
        key: 'percentage',
        fixed: 'right',
        width: 70,
        render: (text: string | number) => `${text}%`,
      },
    ];

    if (!readOnly) {
      /*columns.push({
        key: 'action',
        fixed: 'right',
        width: 40,
        render: (text, record) => (
          <div className="list-actions-column">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                
              }}
            />
          </div>
        )
      });*/
    }

    return columns;
  };

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: AnyRecord[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleAttendanceDetailClicked = (
    record: AnyRecord,
    attendanceDetails: AttendanceDetails,
    day: string,
    curentVal: AttendanceValue
  ) => {
    let newAttendanceValue: AttendanceValue;
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

  handleSelectionChange = (value: string[]) => {
    const { setPageParams } = this.props;
    setPageParams({
      cityId: value[0],
      cityMehfilId: value[1],
    });
  };

  handleMonthChange = (value: any) => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value.format(Formats.MONTH_FORMAT),
    });
  };

  handleMonthGoBack = (value: any) => {
    const { setPageParams } = this.props;
    setPageParams({
      month: value
        .clone()
        .subtract(1, 'months')
        .format(Formats.MONTH_FORMAT),
    });
  };

  handleMonthGoForward = (value: any) => {
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
    handleUpdateAttendanceDetails?.(updatedAttendances);
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
    const citiesData = (cities ?? []).map((city: AnyRecord) => {
      const mehfils = filter(
        cityMehfils,
        (cityMehfil: AnyRecord) => cityMehfil.cityId === city._id
      );
      const dataItem = {
        label: city.name,
        value: city._id,
        children: mehfils.map((mehfil: AnyRecord) => ({
          value: mehfil._id,
          label: mehfil.name,
        })),
      };

      return dataItem;
    });

    return (
      <AntCascader
        style={{ width: '300px' }}
        onChange={this.handleSelectionChange}
        defaultValue={[cityId, cityMehfilId]}
        options={citiesData}
        expandTrigger="hover"
        changeOnSelect
      />
    );
  };

  handleAction = ({ key }: { key: string }) => {
    const {
      handleDeleteAllAttendances,
      handleDeleteSelectedAttendances,
    } = this.props;
    
    if (key === 'delete-selected') {
      const { selectedRows } = this.state;
      if (selectedRows.length === 0) return;
      AntModal.confirm({
        title: 'Delete Selected Attendances',
        content:
          'Are you sure you want to delete the selected attendances?',
        onOk: () => {
          handleDeleteSelectedAttendances?.(selectedRows);
        },
      });
    } else if (key === 'delete-all') {
      AntModal.confirm({
        title: 'Delete All Attendances',
        content:
          'Are you sure you want to delete all attendances for this month?',
        onOk: () => {
          handleDeleteAllAttendances?.();
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
          <AntButton icon={<AntCloseCircleOutlined />} onClick={this.handleCancelAttendances}>
            Cancel
          </AntButton>
          &nbsp;
          <AntButton
            type="primary"
            icon={<AntSaveOutlined />}
            onClick={this.handleSaveAttendances}
          >
            Save
          </AntButton>
        </div>
      );
    }

    const items = [
      {
        key: 'delete-selected',
        label: 'Delete Selected Attendances',
        icon: <AntDeleteOutlined />,
      },
      {
        key: 'delete-all',
        label: 'Delete All Attendances',
        icon: <AntDeleteOutlined />,
      },
    ];

    return (
      <AntDropdown menu={{ items, onClick: this.handleAction }}>
        <AntButton icon={<AntSettingOutlined />}>Actions</AntButton>
      </AntDropdown>
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
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntLeftOutlined />}
            onClick={() => {
              this.handleMonthGoBack(_month);
            }}
          />
          &nbsp;&nbsp;
          <MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={_month}
          />
          &nbsp;&nbsp;
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntRightOutlined />}
            onClick={() => {
              this.handleMonthGoForward(_month);
            }}
          />
        </div>
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  sortedAttendance = (attendance: AnyRecord[] = []) => sortBy(attendance, 'karkun.name');

  render() {
    const { attendance, readOnly } = this.props;

    return (
      <AntTable
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns() as any}
        rowSelection={readOnly ? null : this.rowSelection}
        dataSource={this.sortedAttendance(attendance ?? [])}
        pagination={false}
        scroll={{ x: 1000 }}
        bordered
      />
    );
  }
}
