import React, { useEffect, useRef, useState } from 'react';
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
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { modal } from '/imports/ui/antd-feedback';
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
import { PersonName } from '/imports/ui/modules/helpers/controls';

import { ATTENDANCE_BY_MONTH } from '../gql';
import type { AttendanceSheetsPageParams } from './list-container';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

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

const CascaderStyle = {
  width: '300px',
};

const List = ({
  selectedMonth,
  selectedCategoryId,
  selectedSubCategoryId,
  allJobs,
  allMSDuties,
  allDutyShifts,
  setPageParams,
  handleItemSelected,
  handleCreateMissingAttendances,
  handleEditAttendance,
  handleImportFromGoogleSheet,
  handleViewMeetingCards,
  handleViewKarkunCards,
  handlePrintKarkunsList,
  handlePrintAttendanceSheet,
  handleDeleteSelectedAttendances,
  handleDeleteAllAttendances,
}: ListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRows, setSelectedRows] = useState<AttendanceListRow[]>([]);

  const { data, loading } = useQuery(ATTENDANCE_BY_MONTH, {
    variables: {
      month: selectedMonth.format(Formats.DATE_FORMAT),
      categoryId: selectedCategoryId,
      subCategoryId: selectedSubCategoryId,
    },
  });

  const attendanceByMonth = (data?.attendanceByMonth ?? undefined)?.filter(
    (row): row is AttendanceRow => row != null
  );

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 0;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY(prev =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleMonthChange = (value: Dayjs | null) => {
    if (!value) return;
    setPageParams({
      selectedMonth: value,
    });
  };

  const handleMonthGoBack = () => {
    setPageParams({
      selectedMonth: selectedMonth.clone().subtract(1, 'months'),
    });
  };

  const handleMonthGoForward = () => {
    setPageParams({
      selectedMonth: selectedMonth.clone().add(1, 'months'),
    });
  };

  const handleSelectionChange = (value: (string | number)[]) => {
    setPageParams({
      selectedCategoryId: String(value[0] ?? ''),
      selectedSubCategoryId: value[1] != null ? String(value[1]) : '',
    });
  };

  const handleDownloadAsCSV = () => {
    const sortedAttendanceByMonth = sortBy(
      attendanceByMonth ?? [],
      row => row?.karkun?.sharedData?.name
    );

    const header = 'Name, CNIC, Phone No., Present, Absent, Percetage \r\n';
    const rows = sortedAttendanceByMonth
      .map(attendance => {
        if (!attendance.karkun) return '';
        const sharedData = attendance.karkun.sharedData;
        return `${sharedData?.name}, ${sharedData?.cnicNumber ||
          ''}, ${sharedData?.contactNumber1 || ''}, ${
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

  const handleDeleteSelected = () => {
    modal.confirm({
      title: 'Delete Attendances',
      content:
        'Are you sure you want to delete the selected attendance records?',
      onOk() {
        handleDeleteSelectedAttendances(selectedRows);
      },
    });
  };

  const handleDeleteAll = () => {
    modal.confirm({
      title: 'Delete All Attendances',
      content:
        'Are you sure you want to delete all attendance records for the selected duty/shift/job in the month?',
      onOk() {
        handleDeleteAllAttendances();
      },
    });
  };

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

  const cascaderOptions = [jobsItem].concat(dutiesData);

  const menuItems = [
    {
      key: '1',
      label: (
        <>
          <PlusCircleOutlined />
          &nbsp; Create Missing Attendances
        </>
      ),
      onClick: handleCreateMissingAttendances,
    },
    {
      key: '2',
      label: (
        <>
          <DownloadOutlined />
          &nbsp; Download as CSV
        </>
      ),
      onClick: handleDownloadAsCSV,
    },
    {
      key: '4',
      label: (
        <>
          <ImportOutlined />
          &nbsp; Import from Google Sheets
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
            handleViewMeetingCards(
              selectedRows,
              CardTypes.NAAM_I_MUBARIK_MEETING
            ),
        },
        { type: 'divider' as const },
        {
          key: '5-2',
          label: 'Karkun Cards',
          onClick: () => handleViewKarkunCards(selectedRows),
        },
        { type: 'divider' as const },
        {
          key: '5-3',
          label: 'Karkuns List',
          onClick: () => handlePrintKarkunsList(selectedRows),
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
          <DeleteOutlined />
          &nbsp; Delete Selected Attendances
        </>
      ),
      onClick: handleDeleteSelected,
    },
    {
      key: '7',
      label: (
        <>
          <DeleteOutlined />
          &nbsp; Delete All Attendances
        </>
      ),
      onClick: handleDeleteAll,
    },
  ];

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: ['karkun', 'sharedData', 'name'],
      key: 'karkun.name',
      render: (_text: unknown, record: AttendanceListRow) => (
        <PersonName
          person={
            record.karkun?._id && record.karkun.sharedData?.name
              ? {
                  _id: record.karkun._id,
                  name: record.karkun.sharedData.name,
                  imageId: record.karkun.sharedData.imageId ?? undefined,
                }
              : undefined
          }
          onPersonNameClicked={handleItemSelected}
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
      width: 70,
      render: (_text: unknown, record: AttendanceListRow) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
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
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Space size={8}>
          <Cascader
            style={CascaderStyle}
            onChange={handleSelectionChange}
            defaultValue={[selectedCategoryId, selectedSubCategoryId].filter(
              (value): value is string => value != null && value !== ''
            )}
            options={cascaderOptions}
            expandTrigger="hover"
            changeOnSelect
          />
          <Button
            type="primary"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={handleMonthGoBack}
          />
          <DatePicker.MonthPicker
            allowClear={false}
            format="MMM, YYYY"
            onChange={handleMonthChange}
            value={selectedMonth}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<RightOutlined />}
            onClick={handleMonthGoForward}
          />
        </Space>
      </div>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Dropdown menu={{ items: menuItems }}>
            <Button icon={<SettingOutlined />}>Actions</Button>
          </Dropdown>
        </Space>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const filterAttendanceByMonth = (attendanceByMonth ?? []).filter(
    attendance => attendance?.karkun && attendance._id
  ) as AttendanceListRow[];
  const sortedAttendanceByMonth = sortBy(
    filterAttendanceByMonth,
    row => row.karkun?.sharedData?.name
  );

  const rowSelection = {
    onChange: (
      _selectedRowKeys: React.Key[],
      nextSelectedRows: AttendanceListRow[]
    ) => {
      setSelectedRows(nextSelectedRows);
    },
  };

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        size="middle"
        title={getTableHeader}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={sortedAttendanceByMonth}
        pagination={false}
        bordered
        scroll={{ y: scrollY }}
      />
    </div>
  );
};

export default List;
