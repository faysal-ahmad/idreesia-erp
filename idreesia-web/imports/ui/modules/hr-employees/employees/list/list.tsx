import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  AuditOutlined,
  UserDeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Pagination,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { message } from '/imports/ui/antd-feedback';
import { downloadReport } from 'meteor/idreesia-common/utilities';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import type { PagedHrEmployeesQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  EmploymentStatus,
  EmploymentStatusNames,
  type EmploymentStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import AddEmployeeButton from './add-employee-button';
import ListFilter, {
  EmployeesFilterChips,
  type PageParams,
} from './list-filter';

import { PAGED_HR_EMPLOYEES } from '../gql';
import ExitEmployeeModal from '../lifecycle/exit-employee-modal';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<PagedHrEmployeesQuery['pagedHrEmployees']>['data']
  >[number]
>;

interface Props {
  pageIndex: number;
  pageSize: number;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  jobId?: string;
  /** A STATUS_FILTER_OPTIONS value. */
  status?: string;
  setPageParams(params: PageParams): void;
  handleItemSelected?(record: HrKarkunRow): void;
  handlePrintClicked?(record: HrKarkunRow): void;
  handleAuditLogClicked?(record: HrKarkunRow): void;
  handlePrintSelected?(records: HrKarkunRow[]): void;
  showAddEmployeeButton?: boolean;
  showDownloadButton?: boolean;
  showSelectionColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showDutiesColumn?: boolean;
  showActionsColumn?: boolean;
}

const List = ({
  pageIndex,
  pageSize,
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  jobId,
  status,
  setPageParams,
  handleItemSelected = noop,
  handlePrintClicked = noop,
  handleAuditLogClicked,
  handlePrintSelected,
  showAddEmployeeButton,
  showDownloadButton,
  showSelectionColumn,
  showPhoneNumbersColumn,
  showDutiesColumn,
  showActionsColumn,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRows, setSelectedRows] = useState<HrKarkunRow[]>([]);
  const [exitingRecord, setExitingRecord] = useState<HrKarkunRow | null>(null);
  const employmentStatus =
    status && status !== 'probation-ending' ? status : undefined;
  const probationEndingWithinDays =
    status === 'probation-ending' ? '30' : undefined;
  const {
    data,
    loading,
    refetch: refetchListQuery,
  } = useQuery(PAGED_HR_EMPLOYEES, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        jobId,
        employmentStatus,
        probationEndingWithinDays,
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });
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
        : 64;

      const boundEl = (container.closest('.ant-drawer-body') ??
        container.closest('.ant-layout-content')) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (boundEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(boundEl).paddingBottom) || 0;
        bottomLimit = boundEl.getBoundingClientRect().bottom - paddingBottom;
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

  const nameColumn = {
    title: 'Name',
    dataIndex: ['sharedData', 'name'],
    key: 'name',
    render: (_text: unknown, record: HrKarkunRow) => {
      if (!record._id || !record.sharedData?.name) return null;

      return (
        <PersonName
          person={{
            _id: record._id,
            name: record.sharedData.name,
            imageUrl: record.sharedData.imageUrl ?? undefined,
            imageThumbnailUrl: record.sharedData.imageThumbnailUrl ?? undefined,
          }}
          onPersonNameClicked={() => handleItemSelected(record)}
        />
      );
    },
  };

  const cnicColumn = {
    title: 'CNIC Number',
    dataIndex: ['sharedData', 'cnicNumber'],
    key: 'cnicNumber',
    width: 170,
  };

  const phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    width: 160,
    render: (_text: unknown, record: HrKarkunRow) => {
      const numbers: React.ReactNode[] = [];
      const { contactNumber1, contactNumber2 } = record.sharedData ?? {};
      if (contactNumber1) {
        numbers.push(<Row key="1">{contactNumber1}</Row>);
      }

      if (contactNumber2) {
        numbers.push(<Row key="2">{contactNumber2}</Row>);
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  const dutiesColumn = {
    title: 'Job',
    dataIndex: ['employeeData', 'job'],
    key: 'job',
    render: (_text: unknown, record: HrKarkunRow) => {
      const job = record.employeeData?.job;
      if (!job?.name || !record._id) return null;

      return (
        <Link
          to={`${paths.employeeEditFormPath(record._id)}?default-active-tab=employment`}
        >
          {job.name}
        </Link>
      );
    },
  };

  const statusColumn = {
    title: 'Status',
    key: 'employmentStatus',
    width: 150,
    render: (_text: unknown, record: HrKarkunRow) => {
      const status = record.employeeData?.employmentStatus as
        | EmploymentStatusValue
        | null
        | undefined;
      if (!status) return null;
      const probationEnd = record.employeeData?.probationEndDate;
      return (
        <>
          <Tag color={status === EmploymentStatus.PROBATION ? 'gold' : 'green'}>
            {EmploymentStatusNames[status]}
          </Tag>
          {status === EmploymentStatus.PROBATION && probationEnd ? (
            <div style={{ color: '#667085', fontSize: 12 }}>
              until {dayjs(Number(probationEnd)).format('DD MMM YYYY')}
            </div>
          ) : null}
        </>
      );
    },
  };

  const shiftColumn = {
    title: 'Shift',
    key: 'jobShift',
    width: 130,
    render: (_text: unknown, record: HrKarkunRow) =>
      record.employeeData?.jobShift?.name ?? '',
  };

  const reportsToColumn = {
    title: 'Reports To',
    key: 'reportsTo',
    width: 170,
    render: (_text: unknown, record: HrKarkunRow) =>
      record.employeeData?.reportsTo?.sharedData?.name ?? '',
  };

  const actionsColumn = {
    key: 'action',
    width: 120,
    render: (_text: unknown, record: HrKarkunRow) => (
      <div className="list-actions-column">
        <Tooltip title="Print">
          <PrinterOutlined
            className="list-actions-icon"
            onClick={() => {
              handlePrintClicked(record);
            }}
          />
        </Tooltip>
        <Tooltip title="Audit Log">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogClicked?.(record);
            }}
          />
        </Tooltip>
        <Tooltip title="End Employment">
          <UserDeleteOutlined
            className="list-actions-icon"
            onClick={() => setExitingRecord(record)}
          />
        </Tooltip>
      </div>
    ),
  };

  const getColumns = () => {
    const columns: any[] = [nameColumn, cnicColumn];

    if (showPhoneNumbersColumn) {
      columns.push(phoneNumberColumn);
    }

    if (showDutiesColumn) {
      columns.push(dutiesColumn, shiftColumn, statusColumn, reportsToColumn);
    }

    if (showActionsColumn) {
      columns.push(actionsColumn);
    }

    return columns;
  };

  const rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], rows: HrKarkunRow[]) => {
      setSelectedRows(rows);
    },
  };

  const onChange = (nextPageIndex: number, nextPageSize?: number) => {
    setPageParams({
      pageIndex: nextPageIndex - 1,
      pageSize: nextPageSize ?? 20,
    });
  };

  const onShowSizeChange = (nextPageIndex: number, nextPageSize?: number) => {
    setPageParams({
      pageIndex: nextPageIndex - 1,
      pageSize: nextPageSize ?? 20,
    });
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows
      .map(row => row._id)
      .filter((id): id is string => Boolean(id));
    downloadReport('Karkuns', reportArgs.join(',')).catch(() =>
      message.error('The report could not be downloaded.', 5)
    );
  };

  const onPrintSelected = () => {
    if (selectedRows.length === 0) return;
    handlePrintSelected?.(selectedRows);
  };

  const getActionsMenu = () => {
    if (!showDownloadButton) return null;

    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <PrinterOutlined />
            &nbsp; Print Selected
          </>
        ),
        onClick: onPrintSelected,
      },
      { type: 'divider' as const },
      {
        key: '2',
        label: (
          <>
            <DownloadOutlined />
            &nbsp; Download Selected
          </>
        ),
        onClick: handleExportSelected,
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<SettingOutlined />} />
      </Dropdown>
    );
  };

  const getTableHeader = () => {
    const filterProps = {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      status,
      setPageParams,
      refreshData: refetchListQuery,
    };

    return (
      <div className="list-table-header">
        <Space size={12}>
          {showAddEmployeeButton ? <AddEmployeeButton /> : null}
        </Space>
        <div className="list-table-header-utilities">
          <Space size={8}>
            <ListFilter {...filterProps} />
            {getActionsMenu()}
          </Space>
          <EmployeesFilterChips {...filterProps} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.pagedHrEmployees) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { totalResults, data: rawKarkuns } = data.pagedHrEmployees;
  const karkuns = (rawKarkuns ?? []).filter(
    (row): row is HrKarkunRow => row != null
  );

  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        rowKey="_id"
        className="list-table"
        dataSource={karkuns}
        columns={getColumns() as any}
        title={getTableHeader}
        rowSelection={showSelectionColumn ? rowSelection : undefined}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onChange}
            onShowSizeChange={onShowSizeChange}
            total={totalResults ?? 0}
          />
        )}
      />
      <ExitEmployeeModal
        personId={exitingRecord?._id ?? null}
        personName={exitingRecord?.sharedData?.name}
        onClose={() => setExitingRecord(null)}
      />
    </div>
  );
};

export default List;
