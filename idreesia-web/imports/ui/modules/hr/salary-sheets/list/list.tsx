import React, { Component, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@apollo/client/react';
import FileSaver from 'file-saver';
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
  WarningTwoTone,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

import {
  Button,
  DatePicker,
  Dropdown,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tooltip,
} from 'antd';
import {
  keyBy,
  memoize,
  sortBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type {
  AllJobsQuery,
  CurrentMonthSalariesQuery,
  PreviousMonthSalariesQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

import { PREV_MONTH_SALARIES, CURRENT_MONTH_SALARIES } from '../gql';
import type { SalarySheetsPageParams } from './list-container';

type CurrentSalaryRow = NonNullable<
  NonNullable<CurrentMonthSalariesQuery['salariesByMonth']>[number]
>;
type PrevSalaryRow = NonNullable<
  NonNullable<PreviousMonthSalariesQuery['salariesByMonth']>[number]
>;
type JobRow = NonNullable<
  NonNullable<AllJobsQuery['allJobs']>[number]
> & { _id: string; name: string };

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
  prevSalaries?: PrevSalaryRow[];
  currentSalaries?: CurrentSalaryRow[];
  prevSalariesLoading?: boolean;
  currentSalariesLoading?: boolean;
  setPageParams(params: Partial<Omit<SalarySheetsPageParams, 'selectedMonth'>> & { selectedMonth?: Dayjs }): void;
  handleItemSelected(karkun: { _id: string }): void;
  handleCreateMissingSalaries(): void;
  handleEditSalary(salary: SalaryListRow): void;
  handleViewSalaryReceipts(rows: SalaryListRow[]): void;
  handleViewRashanReceipts(rows: SalaryListRow[]): void;
  handleViewEidReceipts(rows: SalaryListRow[]): void;
  handleApproveSelectedSalaries(rows: SalaryListRow[]): void;
  handleApproveAllSalaries(): void;
  handleDeleteSelectedSalaries(rows: SalaryListRow[]): void;
  handleDeleteAllSalaries(): void;
}

interface ListState {
  selectedRows: SalaryListRow[];
}

const SelectStyle = {
  width: '300px',
};

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

export class List extends Component<ListProps, ListState> {
  state = {
    selectedRows: [],
  };

  getColumns = () => {
    const columns: any[] = [
      {
        key: 'approved',
        render: (text: any, record: SalaryListRow) => {
          if (record.approvedOn) {
            let tooltip = 'Approved';
            if (record.approver) {
              tooltip = `Approved By ${record.approver.name}`;
            }

            return (
              <Tooltip title={tooltip}>
                <CheckCircleTwoTone
                  style={IconStyle}
                  twoToneColor="#52c41a"
                />
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Not Approved">
              <WarningTwoTone
                style={IconStyle}
                twoToneColor="orange"
              />
            </Tooltip>
          );
        },
      },
      {
        title: 'Name',
        key: 'name',
        render: (_text: unknown, record: SalaryListRow) => (
          <KarkunName
            karkun={record.karkun ?? undefined}
            onKarkunNameClicked={this.props.handleItemSelected}
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

    const actionsColumn = {
      key: 'action',
      render: (text: any, record: SalaryListRow) => {
        const { handleEditSalary, handleDeleteSelectedSalaries } = this.props;
        return (
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
        );
      },
    };

    // Don't show the edit and delete actions for salaries from previous months
    const { selectedMonth } = this.props;
    const currentMonth = dayjs();
    if (currentMonth.diff(selectedMonth, 'months') <= 1) {
      return columns.concat(actionsColumn);
    }

    return columns;
  };

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: SalaryListRow[]) => {
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

  handleSelectionChange = (value: string | undefined) => {
    const { setPageParams } = this.props;
    setPageParams({
      selectedJobId: value,
    });
  };

  handlePrintSalaryReceipts = () => {
    const { handleViewSalaryReceipts } = this.props;
    const { selectedRows } = this.state;
    if (handleViewSalaryReceipts) {
      handleViewSalaryReceipts(selectedRows);
    }
  };

  handlePrintRashanReceipts = () => {
    const { handleViewRashanReceipts } = this.props;
    const { selectedRows } = this.state;
    if (handleViewRashanReceipts) {
      handleViewRashanReceipts(selectedRows);
    }
  };

  handlePrintEidReceipts = () => {
    const { handleViewEidReceipts } = this.props;
    const { selectedRows } = this.state;
    if (handleViewEidReceipts) {
      handleViewEidReceipts(selectedRows);
    }
  };

  handleDownloadAsCSV = () => {
    const { currentSalaries } = this.props;
    const sortedSalariesByMonth = sortBy(currentSalaries ?? [], 'karkun.name');

    const header =
      'Name, S/O, CNIC, Phone No., Dept, Bank Account, Salary, Opening Loan, Loan Deduction, New Loan, Closing Loan, Other Deduction, Arrears, Net Payment \r\n';
    const rows = sortedSalariesByMonth.map((salary) => {
        if (!salary.karkun || !salary.job) return '';
        const bankAccountDetails = (salary.karkun.bankAccountDetails || '').replace('\n', ' - ');
        return `${salary.karkun.name}, ${salary.karkun.parentName}, ${salary.karkun.cnicNumber}, ${salary.karkun.contactNumber1}, ${salary.job.name}, ${bankAccountDetails}, ${salary.salary}, ${salary.openingLoan}, ${salary.loanDeduction}, ${salary.newLoan}, ${salary.closingLoan}, ${salary.otherDeduction}, ${salary.arrears}, ${salary.netPayment}`;
      }).filter(Boolean);
    const csvContent = `${header}${rows.join('\r\n')}`;

    const blob = new Blob([csvContent], {
      type: 'data:text/csv;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'salary-sheet.csv');
  };

  _handleApproveSelectedSalaries = () => {
    const { selectedRows } = this.state;
    const { handleApproveSelectedSalaries } = this.props;
    if (handleApproveSelectedSalaries) {
      handleApproveSelectedSalaries(selectedRows);
    }
  };

  _handleDeleteSelectedSalaries = () => {
    const { selectedRows } = this.state;
    const { handleDeleteSelectedSalaries } = this.props;
    if (handleDeleteSelectedSalaries) {
      Modal.confirm({
        title: 'Delete Salaries',
        content: 'Are you sure you want to delete the selected salary records?',
        onOk() {
          handleDeleteSelectedSalaries(selectedRows);
        },
      });
    }
  };

  _handleDeleteAllSalaries = () => {
    const { handleDeleteAllSalaries } = this.props;
    if (handleDeleteAllSalaries) {
      Modal.confirm({
        title: 'Delete All Salaries',
        content:
          'Are you sure you want to delete all salary records for the month?',
        onOk() {
          handleDeleteAllSalaries();
        },
      });
    }
  };

  getJobSelector = () => {
    const { selectedJobId, allJobs } = this.props;

    const options = allJobs.map(job => (
      <Select.Option key={job._id} value={job._id}>
        {job.name}
      </Select.Option>
    ));

    return (
      <Select
        defaultValue={selectedJobId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </Select>
    );
  };

  getActionsMenu = () => {
    const {
      handleCreateMissingSalaries,
      handleApproveAllSalaries,
    } = this.props;

    // Don't show the delete and delete all options in the menu for salaries from previous months
    const { selectedMonth } = this.props;
    const currentMonth = dayjs();
    let showDeleteMenu = false;
    if (currentMonth.diff(selectedMonth, 'months') === 0) {
      showDeleteMenu = true;
    }

    let deleteMenuItems: any[] = [];
    if (showDeleteMenu) {
      deleteMenuItems = [
        { type: 'divider' },
        {
          key: '8',
          label: (
            <>
              <DeleteOutlined />&nbsp;
              Delete Selected Salaries
            </>
          ),
          onClick: this._handleDeleteSelectedSalaries,
        },
        {
          key: '9',
          label: (
            <>
              <DeleteOutlined />&nbsp;
              Delete All Salaries
            </>
          ),
          onClick: this._handleDeleteAllSalaries,
        },
      ];
    }

    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <PlusCircleOutlined />&nbsp;
            Create Missing Salaries
          </>
        ),
        onClick: handleCreateMissingSalaries,
      },
      { type: 'divider' },
      {
        key: '2-1',
        label: (
          <>
            <CheckCircleOutlined />&nbsp;
            Approve Selected Salaries
          </>
        ),
        onClick: this._handleApproveSelectedSalaries,
      },
      {
        key: '2-2',
        label: (
          <>
            <CheckCircleOutlined />&nbsp;
            Approve All Salaries
          </>
        ),
        onClick: handleApproveAllSalaries,
      },
      { type: 'divider' },
      {
        key: '3',
        label: (
          <>
            <FileExcelOutlined />&nbsp;
            Download as CSV
          </>
        ),
        onClick: this.handleDownloadAsCSV,
      },
      {
        key: '4',
        label: (
          <>
            <PrinterOutlined />&nbsp;
            Print Salary Receipts
          </>
        ),
        onClick: this.handlePrintSalaryReceipts,
      },
      {
        key: '5',
        label: (
          <>
            <PrinterOutlined />&nbsp;
            Print Rashan Receipts
          </>
        ),
        onClick: this.handlePrintRashanReceipts,
      },
      {
        key: '6',
        label: (
          <>
            <PrinterOutlined />&nbsp;
            Print Eid Receipts
          </>
        ),
        onClick: this.handlePrintEidReceipts,
      },
      ...deleteMenuItems,
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
          {this.getJobSelector()}
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

  getSortedSalaries = memoize((currentSalaries?: CurrentSalaryRow[], prevSalaries?: PrevSalaryRow[]) => {
    const prevSalariesMap = keyBy(
      (prevSalaries ?? []).filter(row => row?.karkunId),
      'karkunId'
    );
    const sortedCurrentSalaries = sortBy(currentSalaries ?? [], row => row?.karkun?.name);
    return sortedCurrentSalaries.map((currentSalary) => {
      const prevSalary = currentSalary.karkunId
        ? prevSalariesMap[currentSalary.karkunId]
        : undefined;
      return Object.assign({}, currentSalary, {
        prevSalary: prevSalary ? prevSalary.salary : 0,
        prevOtherDeduction: prevSalary ? prevSalary.otherDeduction : 0,
        prevArrears: prevSalary ? prevSalary.arrears : 0,
        prevRashanMadad: prevSalary ? prevSalary.rashanMadad : 0,
      }) as SalaryListRow;
    });
  });

  render() {
    const { currentSalaries, prevSalaries } = this.props;
    const sortedSalariesByMonth = this.getSortedSalaries(
      currentSalaries,
      prevSalaries
    );

    return (
      <Table
        rowKey="_id"
        size="small"
        title={this.getTableHeader}
        columns={this.getColumns()}
        rowSelection={this.rowSelection}
        dataSource={sortedSalariesByMonth}
        pagination={false}
        bordered
      />
    );
  }
}

const ListWithSalaries = (props: ListProps) => {
  const { selectedMonth, selectedJobId } = props;
  const previousMonth = selectedMonth.clone().subtract(1, 'month');

  const {
    data: prevSalariesData,
    loading: prevSalariesLoading,
  } = useQuery(PREV_MONTH_SALARIES, {
    variables: {
      month: previousMonth.format(Formats.DATE_FORMAT),
      jobId: selectedJobId,
    },
  });

  const {
    data: currentSalariesData,
    loading: currentSalariesLoading,
  } = useQuery(CURRENT_MONTH_SALARIES, {
    variables: {
      month: selectedMonth.format(Formats.DATE_FORMAT),
      jobId: selectedJobId,
    },
  });

  return (
    <List
      {...props}
      prevSalariesLoading={prevSalariesLoading}
      prevSalaries={(prevSalariesData?.salariesByMonth ?? undefined)?.filter(
        (row): row is PrevSalaryRow => row != null
      )}
      currentSalariesLoading={currentSalariesLoading}
      currentSalaries={(currentSalariesData?.salariesByMonth ?? undefined)?.filter(
        (row): row is CurrentSalaryRow => row != null
      )}
    />
  );
};

export default ListWithSalaries;
