import React, { Component, type CSSProperties } from 'react';
import { type Dayjs } from 'dayjs';
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
import type {
  AllDutyShiftsQuery,
  AllJobsQuery,
  AttendanceByMonthQuery,
  ComposerAllMsDutiesQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

import { ATTENDANCE_BY_MONTH } from '../gql';
import type { AttendanceSheetsPageParams } from './list-container';

type AttendanceRow = NonNullable<
  NonNullable<AttendanceByMonthQuery['attendanceByMonth']>[number]
>;

export type AttendanceListRow = AttendanceRow & { _id: string };

type JobRow = NonNullable<
  NonNullable<AllJobsQuery['allJobs']>[number]
> & { _id: string; name: string };

type MSDutyRow = NonNullable<
  NonNullable<ComposerAllMsDutiesQuery['allMSDuties']>[number]
> & { _id: string; name: string };

type DutyShiftRow = NonNullable<
  NonNullable<AllDutyShiftsQuery['allDutyShifts']>[number]
> & { _id: string; name: string; dutyId: string };

export interface ListProps {
  selectedMonth: Dayjs;
  selectedCategoryId?: string;
  selectedSubCategoryId?: string;
  allJobs: JobRow[];
  allMSDuties: MSDutyRow[];
  allDutyShifts: DutyShiftRow[];
  attendanceByMonth?: AttendanceRow[];
  attendanceLoading?: boolean;
  setPageParams(
    params: Partial<Omit<AttendanceSheetsPageParams, 'selectedMonth'>> & {
      selectedMonth?: Dayjs;
    }
  ): void;
  handleItemSelected(karkun: { _id: string }): void;
  handleCreateMissingAttendances(): void;
  handleEditAttendance(attendance: AttendanceListRow): void;
  handleImportFromGoogleSheet(): void;
  handleViewMeetingCards(rows: AttendanceListRow[], cardType: string): void;
  handleViewKarkunCards(rows: AttendanceListRow[]): void;
  handlePrintKarkunsList(rows: AttendanceListRow[]): void;
  handlePrintAttendanceSheet(): void;
  handleDeleteSelectedAttendances(rows: AttendanceListRow[]): void;
  handleDeleteAllAttendances(): void;
}

interface ListState {
  selectedRows: AttendanceListRow[];
}

const CascaderStyle: CSSProperties = {
  width: '300px',
};

export class List extends Component<ListProps, ListState> {
  state = {
    selectedRows: [] as AttendanceListRow[],
  };

  columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'karkun.name',
      key: 'karkun.name',
      render: (_text: unknown, record: AttendanceListRow) => (
        <KarkunName
          karkun={record.karkun ?? undefined}
          onKarkunNameClicked={this.props.handleItemSelected}
        />
      ),
    },
    {
      title: 'Job / Duty / Shift',
      key: 'shift.name',
      render: (_text: unknown, record: AttendanceListRow) => {
        if (record.job?.name) {
          return record.job.name;
        }
        let name = record.duty?.name ?? '';
        if (record.shift?.name) {
          name = `${name} - ${record.shift.name}`;
        }
        return name;
      },
    },
    {
      title: 'Present',
      dataIndex: 'presentCount',
      key: 'presentCount',
      render: (text: number | null) => text || '0',
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
      render: (text: number | null) => text || '0',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text: number | null) => `${text}%`,
    },
    {
      key: 'action',
      render: (_text: unknown, record: AttendanceListRow) => {
        const {
          handleEditAttendance,
          handleDeleteSelectedAttendances,
        } = this.props;
        return (
          <div className="list-actions-column">
            <Tooltip key="edit" title="Edit">
              <EditOutlined
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
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: AttendanceListRow[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  handleMonthChange = (value: Dayjs | null) => {
    if (!value) return;
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

  handleSelectionChange = (value: (string | number)[]) => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedCategoryId: String(value[0] ?? ''),
      selectedSubCategoryId: value[1] != null ? String(value[1]) : '',
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
    const sortedAttendanceByMonth = sortBy(attendanceByMonth ?? [], row => row?.karkun?.name);

    const header = 'Name, CNIC, Phone No., Present, Absent, Percetage \r\n';
    const rows = sortedAttendanceByMonth
      .map((attendance) => {
        if (!attendance.karkun) return '';
        return `${attendance.karkun.name}, ${attendance.karkun.cnicNumber ||
          ''}, ${attendance.karkun.contactNumber1 || ''}, ${
          attendance.presentCount
        }, ${attendance.absentCount}, ${attendance.percentage}`;
      })
      .filter(Boolean);
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
      children: allJobs.map(job => ({
        value: job._id,
        label: job.name,
      })),
    };

    const dutiesData = allMSDuties.map(duty => {
      const dutyShifts = filter(
        allDutyShifts,
        dutyShift => dutyShift.dutyId === duty._id
      );
      return {
        label: duty.name,
        value: duty._id,
        children: dutyShifts.map(dutyShift => ({
          value: dutyShift._id,
          label: dutyShift.name,
        })),
      };
    });

    const data = [jobsItem].concat(dutiesData);
    return (
      <Cascader
        style={CascaderStyle}
        onChange={this.handleSelectionChange}
        defaultValue={[selectedCategoryId, selectedSubCategoryId].filter(
          (value): value is string => value != null && value !== ''
        )}
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
            <PlusCircleOutlined />&nbsp;
            Create Missing Attendances
          </>
        ),
        onClick: handleCreateMissingAttendances,
      },
      {
        key: '2',
        label: (
          <>
            <DownloadOutlined />&nbsp;
            Download as CSV
          </>
        ),
        onClick: this.handleDownloadAsCSV,
      },
      {
        key: '4',
        label: (
          <>
            <ImportOutlined />&nbsp;
            Import from Google Sheets
          </>
        ),
        onClick: handleImportFromGoogleSheet,
      },
      { type: 'divider' as const },
      {
        key: '5',
        label: 'Print',
        icon: <PrinterOutlined />,
        children: [
          {
            key: '5-1',
            label: 'Naam-i-Mubarik Meeting Cards',
            onClick: () =>
              this.handleViewMeetingCards(CardTypes.NAAM_I_MUBARIK_MEETING),
          },
          { type: 'divider' as const },
          {
            key: '5-2',
            label: 'Karkun Cards',
            onClick: () => this.handleViewKarkunCards(),
          },
          { type: 'divider' as const },
          {
            key: '5-3',
            label: 'Karkuns List',
            onClick: () => this.handlePrintKarkunsList(),
          },
          { type: 'divider' as const },
          {
            key: '5-4',
            label: 'Attendance Sheet',
            onClick: () => handlePrintAttendanceSheet(),
          },
        ],
      },
      { type: 'divider' as const },
      {
        key: '6',
        label: (
          <>
            <DeleteOutlined />&nbsp;
            Delete Selected Attendances
          </>
        ),
        onClick: this._handleDeleteSelectedAttendances,
      },
      {
        key: '7',
        label: (
          <>
            <DeleteOutlined />&nbsp;
            Delete All Attendances
          </>
        ),
        onClick: this._handleDeleteAllAttendances,
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<SettingOutlined />}>Actions</Button>
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
            icon={<LeftOutlined />}
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
            icon={<RightOutlined />}
            onClick={this.handleMonthGoForward}
          />
        </div>
        <div>{this.getActionsMenu()}</div>
      </div>
    );
  };

  render() {
    const { attendanceByMonth } = this.props;
    const filterAttendanceByMonth = (attendanceByMonth ?? []).filter(
      attendance => attendance?.karkun && attendance._id
    ) as AttendanceListRow[];
    const sortedAttendanceByMonth = sortBy(filterAttendanceByMonth, row => row.karkun?.name);

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

const ListWithAttendance = (props: ListProps) => {
  const { selectedMonth, selectedCategoryId, selectedSubCategoryId } = props;
  const { data, loading } = useQuery(ATTENDANCE_BY_MONTH, {
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
      attendanceByMonth={(data?.attendanceByMonth ?? undefined)?.filter(
        (row): row is AttendanceRow => row != null
      )}
    />
  );
};

export default ListWithAttendance;
