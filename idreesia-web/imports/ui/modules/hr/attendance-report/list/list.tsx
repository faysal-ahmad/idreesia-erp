import React, { useEffect, useRef, useState } from 'react';
import { type Dayjs } from 'dayjs';
import { useQuery } from '@apollo/client/react';
import FileSaver from 'file-saver';
import {
  DownloadOutlined,
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
  Space,
  Spin,
  Table,
  type TableColumnsType,
} from 'antd';
import { CardTypes } from 'meteor/idreesia-common/constants/hr';
import type {
  AllDutyShiftsQuery,
  ComposerAllDutyLocationsQuery,
  ComposerAllMsDutiesQuery,
  DutyAttendanceSheetQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import { DUTY_ATTENDANCE_SHEET } from '../gql';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type AttendanceRow = NonNullable<
  NonNullable<DutyAttendanceSheetQuery['dutyAttendanceSheet']>[number]
>;

export type AttendanceListRow = AttendanceRow & { _id: string; karkunId: string };

type MSDutyRow = NonNullable<
  NonNullable<ComposerAllMsDutiesQuery['allMSDuties']>[number]
> & { _id: string; name: string };

type DutyLocationRow = NonNullable<
  NonNullable<ComposerAllDutyLocationsQuery['allDutyLocations']>[number]
> & { _id: string; name: string; dutyId: string };

type DutyShiftRow = NonNullable<
  NonNullable<AllDutyShiftsQuery['allDutyShifts']>[number]
> & { _id: string; name: string; dutyId: string };

export interface ListProps {
  selectedMonth: Dayjs;
  dutyId?: string;
  locationId?: string;
  shiftId?: string;
  allMSDuties: MSDutyRow[];
  allDutyLocations: DutyLocationRow[];
  allDutyShifts: DutyShiftRow[];
  onMonthChange(month: Dayjs): void;
  onSelectionChange(selection: {
    dutyId?: string;
    locationId?: string;
    shiftId?: string;
  }): void;
  handleItemSelected(karkun: { _id: string }): void;
  handleViewMeetingCards(rows: AttendanceListRow[], cardType: string): void;
  handleViewKarkunCards(rows: AttendanceListRow[]): void;
  handlePrintKarkunsList(rows: AttendanceListRow[]): void;
  handlePrintAttendanceSheet(): void;
}

// Cascader value for "every location" under a duty.
const ALL_LOCATIONS = '__all__';

const CascaderStyle = {
  width: '300px',
};

const List = ({
  selectedMonth,
  dutyId,
  locationId,
  shiftId,
  allMSDuties,
  allDutyLocations,
  allDutyShifts,
  onMonthChange,
  onSelectionChange,
  handleItemSelected,
  handleViewMeetingCards,
  handleViewKarkunCards,
  handlePrintKarkunsList,
  handlePrintAttendanceSheet,
}: ListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRows, setSelectedRows] = useState<AttendanceListRow[]>([]);

  const { data, loading } = useQuery(DUTY_ATTENDANCE_SHEET, {
    variables: {
      month: selectedMonth.format('MM-YYYY'),
      dutyId: dutyId ?? '',
      locationId,
      shiftId,
    },
    skip: !dutyId,
  });

  const sheetRows = (data?.dutyAttendanceSheet ?? []).filter(
    (row): row is AttendanceListRow => row?._id != null && row.karkunId != null
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
    onMonthChange(value);
  };

  const handleMonthGoBack = () => {
    onMonthChange(selectedMonth.clone().subtract(1, 'months'));
  };

  const handleMonthGoForward = () => {
    onMonthChange(selectedMonth.clone().add(1, 'months'));
  };

  const handleSelectionChange = (value: (string | number)[]) => {
    const [nextDutyId, nextLocationId, nextShiftId] = value.map(String);
    onSelectionChange({
      dutyId: nextDutyId,
      locationId:
        nextLocationId && nextLocationId !== ALL_LOCATIONS
          ? nextLocationId
          : undefined,
      shiftId: nextShiftId,
    });
  };

  const handleDownloadAsCSV = () => {
    const header =
      'Name, CNIC, Phone No., Location, Shift, Days, Present, Late, Absent, Not Marked, Percentage \r\n';
    const rows = sheetRows.map(row => {
      const sharedData = row.karkun?.sharedData;
      return [
        sharedData?.name ?? row.name,
        sharedData?.cnicNumber || '',
        sharedData?.contactNumber1 || '',
        row.location?.name ?? '',
        row.shiftName ?? '',
        row.daysOnDuty,
        row.presentCount,
        row.lateCount,
        row.absentCount,
        row.unmarkedCount,
        row.percentage,
      ].join(', ');
    });
    const csvContent = `${header}${rows.join('\r\n')}`;

    const blob = new Blob([csvContent], {
      type: 'data:text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'attendance-sheet.csv');
  };

  const cascaderOptions = allMSDuties.map(duty => {
    const shiftOptions = allDutyShifts
      .filter(dutyShift => dutyShift.dutyId === duty._id)
      .map(dutyShift => ({ value: dutyShift._id, label: dutyShift.name }));
    const locationOptions = allDutyLocations
      .filter(dutyLocation => dutyLocation.dutyId === duty._id)
      .map(dutyLocation => ({
        value: dutyLocation._id,
        label: dutyLocation.name,
        children: shiftOptions,
      }));
    return {
      label: duty.name,
      value: duty._id,
      children: [
        { value: ALL_LOCATIONS, label: 'All locations', children: shiftOptions },
        ...locationOptions,
      ],
    };
  });

  let cascaderValue: string[] = [];
  if (dutyId) {
    cascaderValue = [dutyId];
    if (locationId || shiftId) cascaderValue.push(locationId ?? ALL_LOCATIONS);
    if (shiftId) cascaderValue.push(shiftId);
  }

  const menuItems = [
    {
      key: 'csv',
      label: (
        <>
          <DownloadOutlined />
          &nbsp; Download as CSV
        </>
      ),
      onClick: handleDownloadAsCSV,
    },
    { type: 'divider' as const },
    {
      key: 'print',
      label: 'Print',
      icon: <PrinterOutlined />,
      children: [
        {
          key: 'print-meeting-cards',
          label: 'Naam-i-Mubarik Meeting Cards',
          onClick: () =>
            handleViewMeetingCards(
              selectedRows,
              CardTypes.NAAM_I_MUBARIK_MEETING
            ),
        },
        { type: 'divider' as const },
        {
          key: 'print-karkun-cards',
          label: 'Karkun Cards',
          onClick: () => handleViewKarkunCards(selectedRows),
        },
        { type: 'divider' as const },
        {
          key: 'print-karkuns-list',
          label: 'Karkuns List',
          onClick: () => handlePrintKarkunsList(selectedRows),
        },
        { type: 'divider' as const },
        {
          key: 'print-attendance-sheet',
          label: 'Attendance Sheet',
          onClick: () => handlePrintAttendanceSheet(),
        },
      ],
    },
  ];

  const countColumn = (
    title: string,
    dataIndex: keyof AttendanceListRow
  ) => ({
    title,
    dataIndex,
    key: dataIndex,
    width: 90,
    align: 'right' as const,
    render: (value: number | null) => value ?? 0,
  });

  const columns: TableColumnsType<AttendanceListRow> = [
    {
      title: 'Name',
      key: 'name',
      render: (_text, record) => (
        <PersonName
          person={{
            _id: record.karkunId,
            name: record.karkun?.sharedData?.name ?? record.name ?? '',
            imageId: record.karkun?.sharedData?.imageId ?? undefined,
            imageThumbnailId:
              record.karkun?.sharedData?.imageThumbnailId ?? undefined,
          }}
          onPersonNameClicked={handleItemSelected}
        />
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_text, record) => record.location?.name ?? '',
    },
    {
      title: 'Shift',
      dataIndex: 'shiftName',
      key: 'shiftName',
    },
    countColumn('Days', 'daysOnDuty'),
    countColumn('Present', 'presentCount'),
    countColumn('Late', 'lateCount'),
    countColumn('Absent', 'absentCount'),
    countColumn('Not Marked', 'unmarkedCount'),
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 110,
      align: 'right',
      render: (value: number | null) => `${value ?? 0}%`,
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Space size={8}>
          <Cascader
            style={CascaderStyle}
            onChange={handleSelectionChange}
            value={cascaderValue}
            placeholder="Select a duty"
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
        dataSource={sheetRows}
        pagination={false}
        bordered
        scroll={{ y: scrollY }}
      />
    </div>
  );
};

export default List;
