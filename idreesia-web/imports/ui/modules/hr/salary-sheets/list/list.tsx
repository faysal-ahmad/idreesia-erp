import React, { useEffect, useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@apollo/client/react';
import FileSaver from 'file-saver';
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Dropdown,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { modal } from '/imports/ui/antd-feedback';
import { keyBy, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type {
  AllJobsQuery,
  CurrentMonthSalariesQuery,
  PreviousMonthSalariesQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import { PREV_MONTH_SALARIES, CURRENT_MONTH_SALARIES } from '../gql';
import type { SalarySheetsPageParams } from './list-container';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type CurrentSalaryRow = NonNullable<
  NonNullable<CurrentMonthSalariesQuery['salariesByMonth']>[number]
>;
type PrevSalaryRow = NonNullable<
  NonNullable<PreviousMonthSalariesQuery['salariesByMonth']>[number]
>;
type JobRow = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]> & {
  _id: string;
  name: string;
};

export type SalaryListRow = CurrentSalaryRow & {
  prevSalary: number;
  prevOtherDeduction: number;
  prevArrears: number;
  prevRashanMadad: number;
};

interface ListProps {
  selectedMonth: Dayjs;
  selectedJobId?: string;
  allJobs: JobRow[];
  setPageParams(
    params: Partial<Omit<SalarySheetsPageParams, 'selectedMonth'>> & {
      selectedMonth?: Dayjs;
    }
  ): void;
  handleItemSelected(karkun: { _id: string }): void;
  handleCreateMissingSalaries(): void;
  handleEditSalary(salary: SalaryListRow): void;
  handleViewSalaryReceipts(rows: SalaryListRow[]): void;
  handleViewRashanReceipts(rows: SalaryListRow[]): void;
  handleViewEidReceipts(rows: SalaryListRow[]): void;
  handleDeleteSelectedSalaries(rows: SalaryListRow[]): void;
  handleDeleteAllSalaries(): void;
}

const SelectStyle = {
  width: '300px',
};

const getSortedSalaries = (
  currentSalaries?: CurrentSalaryRow[],
  prevSalaries?: PrevSalaryRow[]
): SalaryListRow[] => {
  const prevSalariesMap = keyBy(
    (prevSalaries ?? []).filter(row => row?.karkunId),
    'karkunId'
  );
  const sortedCurrentSalaries = sortBy(
    currentSalaries ?? [],
    row => row?.karkun?.sharedData?.name
  );
  return sortedCurrentSalaries.map(currentSalary => {
    const prevSalary = currentSalary.karkunId
      ? prevSalariesMap[currentSalary.karkunId]
      : undefined;
    return {
      ...currentSalary,
      prevSalary: prevSalary ? prevSalary.salary : 0,
      prevOtherDeduction: prevSalary ? prevSalary.otherDeduction : 0,
      prevArrears: prevSalary ? prevSalary.arrears : 0,
      prevRashanMadad: prevSalary ? prevSalary.rashanMadad : 0,
    } as SalaryListRow;
  });
};

const List = ({
  selectedMonth,
  selectedJobId,
  allJobs,
  setPageParams,
  handleItemSelected,
  handleCreateMissingSalaries,
  handleEditSalary,
  handleViewSalaryReceipts,
  handleViewRashanReceipts,
  handleViewEidReceipts,
  handleDeleteSelectedSalaries,
  handleDeleteAllSalaries,
}: ListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRows, setSelectedRows] = useState<SalaryListRow[]>([]);

  const previousMonth = selectedMonth.clone().subtract(1, 'month');

  const { data: prevSalariesData, loading: prevSalariesLoading } = useQuery(
    PREV_MONTH_SALARIES,
    {
      variables: {
        month: previousMonth.format(Formats.DATE_FORMAT),
        jobId: selectedJobId,
      },
    }
  );

  const { data: currentSalariesData, loading: currentSalariesLoading } =
    useQuery(CURRENT_MONTH_SALARIES, {
      variables: {
        month: selectedMonth.format(Formats.DATE_FORMAT),
        jobId: selectedJobId,
      },
    });

  const prevSalaries = (prevSalariesData?.salariesByMonth ?? undefined)?.filter(
    (row): row is PrevSalaryRow => row != null
  );
  const currentSalaries = (
    currentSalariesData?.salariesByMonth ?? undefined
  )?.filter((row): row is CurrentSalaryRow => row != null);

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

  const handleSelectionChange = (value: string | undefined) => {
    setPageParams({
      selectedJobId: value,
    });
  };

  const handleDownloadAsCSV = () => {
    const sortedSalariesByMonth = sortBy(
      currentSalaries ?? [],
      salary => salary.karkun?.sharedData?.name
    );

    const header =
      'Name, S/O, CNIC, Phone No., Dept, Bank Account, Salary, Opening Loan, Loan Deduction, New Loan, Closing Loan, Other Deduction, Arrears, Net Payment \r\n';
    const rows = sortedSalariesByMonth
      .map(salary => {
        if (!salary.karkun || !salary.job) return '';
        const sharedData = salary.karkun.sharedData ?? ({} as NonNullable<typeof salary.karkun.sharedData>);
        const bankAccountDetails = (
          salary.karkun.employeeData?.bankAccountDetails || ''
        ).replace('\n', ' - ');
        return `${sharedData.name}, ${sharedData.parentName}, ${sharedData.cnicNumber}, ${sharedData.contactNumber1}, ${salary.job.name}, ${bankAccountDetails}, ${salary.salary}, ${salary.openingLoan}, ${salary.loanDeduction}, ${salary.newLoan}, ${salary.closingLoan}, ${salary.otherDeduction}, ${salary.arrears}, ${salary.netPayment}`;
      })
      .filter(Boolean);
    const csvContent = `${header}${rows.join('\r\n')}`;

    const blob = new Blob([csvContent], {
      type: 'data:text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'salary-sheet.csv');
  };

  const handleDeleteSelected = () => {
    modal.confirm({
      title: 'Delete Salaries',
      content: 'Are you sure you want to delete the selected salary records?',
      onOk() {
        handleDeleteSelectedSalaries(selectedRows);
      },
    });
  };

  const handleDeleteAll = () => {
    modal.confirm({
      title: 'Delete All Salaries',
      content:
        'Are you sure you want to delete all salary records for the month?',
      onOk() {
        handleDeleteAllSalaries();
      },
    });
  };

  const currentMonth = dayjs();
  const showDeleteMenu = currentMonth.diff(selectedMonth, 'months') === 0;
  const showRowActions = currentMonth.diff(selectedMonth, 'months') <= 1;

  const columns: any[] = [
    {
      title: 'Name',
      key: 'name',
      width: 300,
      render: (_text: unknown, record: SalaryListRow) => (
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
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (text: any, record: SalaryListRow) => {
        if (record.salary !== record.prevSalary) {
          const tooltip = `Last month Salary value was ${record.prevSalary}`;
          return (
            <Tooltip title={tooltip}>
              <span style={{ fontWeight: 'bold', color: 'orange' }}>
                {text}
              </span>
            </Tooltip>
          );
        }
        return text;
      },
    },
    {
      title: 'Rashan',
      dataIndex: 'rashanMadad',
      key: 'rashanMadad',
      render: (text: any, record: SalaryListRow) => {
        if (record.rashanMadad !== record.prevRashanMadad) {
          const tooltip = `Last month Rashan value was ${record.prevRashanMadad}`;
          return (
            <Tooltip title={tooltip}>
              <span style={{ fontWeight: 'bold', color: 'orange' }}>
                {text}
              </span>
            </Tooltip>
          );
        }
        return text;
      },
    },
    {
      title: 'Loan',
      children: [
        {
          title: 'Opening',
          dataIndex: 'openingLoan',
          key: 'openingLoan',
        },
        {
          title: 'Deduction',
          dataIndex: 'loanDeduction',
          key: 'loanDeduction',
        },
        {
          title: 'New',
          dataIndex: 'newLoan',
          key: 'newLoan',
        },
        {
          title: 'Closing',
          dataIndex: 'closingLoan',
          key: 'closingLoan',
        },
      ],
    },
    {
      title: 'Other Deduction',
      dataIndex: 'otherDeduction',
      key: 'otherDeduction',
      render: (text: any, record: SalaryListRow) => {
        if (record.otherDeduction !== record.prevOtherDeduction) {
          const tooltip = `Last month Other Deduction value was ${record.prevOtherDeduction}`;
          return (
            <Tooltip title={tooltip}>
              <span style={{ fontWeight: 'bold', color: 'orange' }}>
                {text}
              </span>
            </Tooltip>
          );
        }
        return text;
      },
    },
    {
      title: 'Arrears',
      dataIndex: 'arrears',
      key: 'arrears',
      render: (text: any, record: SalaryListRow) => {
        if (record.arrears !== record.prevArrears) {
          const tooltip = `Last month Arrears value was ${record.prevArrears}`;
          return (
            <Tooltip title={tooltip}>
              <span style={{ fontWeight: 'bold', color: 'orange' }}>
                {text}
              </span>
            </Tooltip>
          );
        }
        return text;
      },
    },
    {
      title: 'Net Payment',
      dataIndex: 'netPayment',
      key: 'netPayment',
    },
  ];

  if (showRowActions) {
    columns.push({
      key: 'action',
      width: 70,
      render: (_text: unknown, record: SalaryListRow) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditSalary(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this salary record?"
            onConfirm={() => {
              handleDeleteSelectedSalaries([record]);
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
    });
  }

  let deleteMenuItems: any[] = [];
  if (showDeleteMenu) {
    deleteMenuItems = [
      { type: 'divider' },
      {
        key: '8',
        label: (
          <>
            <DeleteOutlined />
            &nbsp; Delete Selected Salaries
          </>
        ),
        onClick: handleDeleteSelected,
      },
      {
        key: '9',
        label: (
          <>
            <DeleteOutlined />
            &nbsp; Delete All Salaries
          </>
        ),
        onClick: handleDeleteAll,
      },
    ];
  }

  const menuItems = [
    {
      key: '1',
      label: (
        <>
          <PlusCircleOutlined />
          &nbsp; Create Missing Salaries
        </>
      ),
      onClick: handleCreateMissingSalaries,
    },
    { type: 'divider' },
    {
      key: '3',
      label: (
        <>
          <FileExcelOutlined />
          &nbsp; Download as CSV
        </>
      ),
      onClick: handleDownloadAsCSV,
    },
    {
      key: '4',
      label: (
        <>
          <PrinterOutlined />
          &nbsp; Print Salary Receipts
        </>
      ),
      onClick: () => handleViewSalaryReceipts(selectedRows),
    },
    {
      key: '5',
      label: (
        <>
          <PrinterOutlined />
          &nbsp; Print Rashan Receipts
        </>
      ),
      onClick: () => handleViewRashanReceipts(selectedRows),
    },
    {
      key: '6',
      label: (
        <>
          <PrinterOutlined />
          &nbsp; Print Eid Receipts
        </>
      ),
      onClick: () => handleViewEidReceipts(selectedRows),
    },
    ...deleteMenuItems,
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Space size={8}>
          <Select
            value={selectedJobId || undefined}
            style={SelectStyle}
            onChange={handleSelectionChange}
            allowClear
            popupMatchSelectWidth
            placeholder="All jobs"
          >
            {allJobs.map(job => (
              <Select.Option key={job._id} value={job._id}>
                {job.name}
              </Select.Option>
            ))}
          </Select>
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

  if (prevSalariesLoading || currentSalariesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const sortedSalariesByMonth = getSortedSalaries(
    currentSalaries,
    prevSalaries
  );

  const rowSelection = {
    onChange: (
      _selectedRowKeys: React.Key[],
      nextSelectedRows: SalaryListRow[]
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
        dataSource={sortedSalariesByMonth}
        pagination={false}
        bordered
        scroll={{ y: scrollY }}
      />
    </div>
  );
};

export default List;
