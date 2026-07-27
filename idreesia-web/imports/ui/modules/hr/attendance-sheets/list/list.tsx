import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import FileSaver from 'file-saver';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ImportOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  PrinterOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Modal,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';

import {
  filter,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { CardTypes } from 'meteor/idreesia-common/constants/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

import { ATTENDANCE_BY_MONTH } from '../gql';

const AntButton = Button as any;
const AntCascader = Cascader as any;
const AntDatePicker = DatePicker as any;
const AntDropdown = Dropdown as any;
const AntModal = Modal as any;
const AntPopconfirm = Popconfirm as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntDownloadOutlined = DownloadOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntImportOutlined = ImportOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntSettingOutlined = SettingOutlined as any;
const AntPrinterOutlined = PrinterOutlined as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const KarkunNameDisplay = KarkunName as any;
type AnyRecord = Record<string, any>;
interface ListProps extends AnyRecord { selectedMonth: any; selectedCategoryId?: string; selectedSubCategoryId?: string; allJobs: AnyRecord[]; allMSDuties: AnyRecord[]; allDutyShifts: AnyRecord[]; attendanceByMonth?: AnyRecord[]; setPageParams(params: AnyRecord): void; }
interface ListState { selectedRows: AnyRecord[]; }

const CascaderStyle = {
  width: '300px',
};

export class List extends Component<ListProps, ListState> {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedCategoryId: PropTypes.string,
    selectedSubCategoryId: PropTypes.string,
    allJobs: PropTypes.array,
    allMSDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,

    attendanceByMonth: PropTypes.array,
    attendanceLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleCreateMissingAttendances: PropTypes.func,
    handleEditAttendance: PropTypes.func,
    handleImportFromGoogleSheet: PropTypes.func,
    handleViewMeetingCards: PropTypes.func,
    handleViewKarkunCards: PropTypes.func,
    handlePrintKarkunsList: PropTypes.func,
    handlePrintAttendanceSheet: PropTypes.func,
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
      render: (_text: any, record: AnyRecord) => (
        <KarkunNameDisplay
          karkun={record.karkun}
          onKarkunNameClicked={this.props.handleItemSelected}
        />
      ),
    },
    {
      title: 'Job / Duty / Shift',
      key: 'shift.name',
      render: (text: any, record: AnyRecord) => {
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
      render: (text: any) => text || '0',
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
      render: (text: any) => text || '0',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text: any) => `${text}%`,
    },
    {
      key: 'action',
      render: (text: any, record: AnyRecord) => {
        const {
          handleEditAttendance,
          handleDeleteSelectedAttendances,
        } = this.props;
        return (
          <div className="list-actions-column">
            <AntTooltip key="edit" title="Edit">
              <AntEditOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleEditAttendance(record);
                }}
              />
            </AntTooltip>
            <AntPopconfirm
              title="Are you sure you want to delete this attendance record?"
              onConfirm={() => {
                handleDeleteSelectedAttendances([record]);
              }}
              okText="Yes"
              cancelText="No"
            >
              <AntTooltip key="delete" title="Delete">
                <AntDeleteOutlined className="list-actions-icon" />
              </AntTooltip>
            </AntPopconfirm>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: AnyRecord[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleMonthChange = (value: any) => {
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

  handleSelectionChange = (value: string[]) => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedCategoryId: value[0],
      selectedSubCategoryId: value[1],
    });
  };

  handleViewMeetingCards = (cardType: string) => {
    const { handleViewMeetingCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewMeetingCards) {
      handleViewMeetingCards(selectedRows, cardType);
    }
  };

  handleViewKarkunCards = () => {
    const { handleViewKarkunCards } = this.props;
    const { selectedRows } = this.state;
    if (handleViewKarkunCards) {
      handleViewKarkunCards(selectedRows);
    }
  };

  handlePrintKarkunsList = () => {
    const { handlePrintKarkunsList } = this.props;
    const { selectedRows } = this.state;

    if (handlePrintKarkunsList) {
      handlePrintKarkunsList(selectedRows);
    }
  };

  handleDownloadAsCSV = () => {
    const { attendanceByMonth } = this.props;
    const sortedAttendanceByMonth = sortBy(attendanceByMonth ?? [], 'karkun.name');

    const header = 'Name, CNIC, Phone No., Present, Absent, Percetage \r\n';
    const rows = sortedAttendanceByMonth.map(
      (attendance: AnyRecord) =>
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
      AntModal.confirm({
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
      AntModal.confirm({
        title: 'Delete All Attendances',
        content:
          'Are you sure you want to delete all attendance records for the selected duty/shift/job in the month?',
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
      allMSDuties,
      allDutyShifts,
    } = this.props;

    const jobsItem = {
      label: 'All Jobs',
      value: 'all_jobs',
      children: allJobs.map((job: AnyRecord) => ({
        value: job._id,
        label: job.name,
      })),
    };

    const dutiesData = allMSDuties.map((duty: AnyRecord) => {
      const dutyShifts = filter(
        allDutyShifts,
        (dutyShift: AnyRecord) => dutyShift.dutyId === duty._id
      );
      const dataItem = {
        label: duty.name,
        value: duty._id,
        children: dutyShifts.map((dutyShift: AnyRecord) => ({
          value: dutyShift._id,
          label: dutyShift.name,
        })),
      };

      return dataItem;
    });

    const data = [jobsItem].concat(dutiesData);
    return (
      <AntCascader
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
      handleImportFromGoogleSheet,
      handlePrintAttendanceSheet,
    } = this.props;
    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <AntPlusCircleOutlined />&nbsp;
            Create Missing Attendances
          </>
        ),
        onClick: handleCreateMissingAttendances,
      },
      {
        key: '2',
        label: (
          <>
            <AntDownloadOutlined />&nbsp;
            Download as CSV
          </>
        ),
        onClick: this.handleDownloadAsCSV,
      },
      {
        key: '4',
        label: (
          <>
            <AntImportOutlined />&nbsp;
            Import from Google Sheets
          </>
        ),
        onClick: handleImportFromGoogleSheet,
      },
      { type: 'divider' },
      {
        key: '5',
        label: 'Print',
        icon: <AntPrinterOutlined />,
        children: [
          {
            key: '5-1',
            label: 'Naam-i-Mubarik Meeting Cards',
            onClick: () =>
              this.handleViewMeetingCards(CardTypes.NAAM_I_MUBARIK_MEETING),
          },
          { type: 'divider' },
          {
            key: '5-2',
            label: 'Karkun Cards',
            onClick: () => this.handleViewKarkunCards(),
          },
          { type: 'divider' },
          {
            key: '5-3',
            label: 'Karkuns List',
            onClick: () => this.handlePrintKarkunsList(),
          },
          { type: 'divider' },
          {
            key: '5-4',
            label: 'Attendance Sheet',
            onClick: () => handlePrintAttendanceSheet(),
          },
        ],
      },
      { type: 'divider' },
      {
        key: '6',
        label: (
          <>
            <AntDeleteOutlined />&nbsp;
            Delete Selected Attendances
          </>
        ),
        onClick: this._handleDeleteSelectedAttendances,
      },
      {
        key: '7',
        label: (
          <>
            <AntDeleteOutlined />&nbsp;
            Delete All Attendances
          </>
        ),
        onClick: this._handleDeleteAllAttendances,
      },
    ];

    return (
      <AntDropdown menu={{ items: menuItems }}>
        <AntButton icon={<AntSettingOutlined />}>Actions</AntButton>
      </AntDropdown>
    );
  };

  getTableHeader = () => {
    const { selectedMonth } = this.props;
    return (
      <div className="list-table-header">
        <div className="list-table-header-section">
          {this.getDutyShiftSelector()}
          &nbsp;&nbsp;
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntLeftOutlined />}
            onClick={this.handleMonthGoBack}
          />
          &nbsp;&nbsp;
          <AntDatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={this.handleMonthChange}
            value={selectedMonth}
          />
          &nbsp;&nbsp;
          <AntButton
            type="primary"
            shape="circle"
            icon={<AntRightOutlined />}
            onClick={this.handleMonthGoForward}
          />
        </div>
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  render() {
    const { attendanceByMonth } = this.props;
    const filterAttendanceByMonth = filter(attendanceByMonth, attendance => !!attendance.karkun)
    const sortedAttendanceByMonth = sortBy(filterAttendanceByMonth, 'karkun.name');

    return (
      <AntTable
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

const ListWithAttendance = (props: ListProps) => {
  const { selectedMonth, selectedCategoryId, selectedSubCategoryId } = props;
  const { data, loading, ...queryResult } = useQuery(ATTENDANCE_BY_MONTH as any, {
    variables: {
      month: selectedMonth.format(Formats.DATE_FORMAT),
      categoryId: selectedCategoryId,
      subCategoryId: selectedSubCategoryId,
    },
  });

  return (
    <List
      {...props}
      attendanceLoading={loading}
      loading={loading}
      {...queryResult}
      {...(data || {})}
    />
  );
};

ListWithAttendance.propTypes = {
  selectedMonth: PropTypes.object,
  selectedCategoryId: PropTypes.string,
  selectedSubCategoryId: PropTypes.string,
};

export default ListWithAttendance;
