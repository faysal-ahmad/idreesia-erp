import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
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
import { KarkunName } from '/imports/ui/modules/hr/common/controls';

import { PREV_MONTH_SALARIES, CURRENT_MONTH_SALARIES } from '../gql';

const AntButton = Button as any;
const AntDatePicker = DatePicker as any;
const AntDropdown = Dropdown as any;
const AntModal = Modal as any;
const AntPopconfirm = Popconfirm as any;
const AntSelect = Select as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntCheckCircleOutlined = CheckCircleOutlined as any;
const AntCheckCircleTwoTone = CheckCircleTwoTone as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntFileExcelOutlined = FileExcelOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntPrinterOutlined = PrinterOutlined as any;
const AntSettingOutlined = SettingOutlined as any;
const AntWarningTwoTone = WarningTwoTone as any;
const AntLeftOutlined = LeftOutlined as any;
const AntRightOutlined = RightOutlined as any;
const KarkunNameDisplay = KarkunName as any;
type AnyRecord = Record<string, any>;
interface ListProps extends AnyRecord { selectedMonth: any; selectedJobId?: string; allJobs: AnyRecord[]; prevSalaries?: AnyRecord[]; currentSalaries?: AnyRecord[]; setPageParams(params: AnyRecord): void; }
interface ListState { selectedRows: AnyRecord[]; }
interface QueryData { salariesByMonth?: AnyRecord[]; }

const SelectStyle = {
  width: '300px',
};

const IconStyle = {
  fontSize: '20px',
};

export class List extends Component<ListProps, ListState> {
  static propTypes = {
    selectedMonth: PropTypes.object,
    selectedJobId: PropTypes.string,
    allJobs: PropTypes.array,

    prevSalaries: PropTypes.array,
    prevSalariesLoading: PropTypes.bool,
    currentSalaries: PropTypes.array,
    currentSalariesLoading: PropTypes.bool,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleCreateMissingSalaries: PropTypes.func,
    handleEditSalary: PropTypes.func,
    handleViewSalaryReceipts: PropTypes.func,
    handleViewRashanReceipts: PropTypes.func,
    handleViewEidReceipts: PropTypes.func,
    handleApproveSelectedSalaries: PropTypes.func,
    handleApproveAllSalaries: PropTypes.func,
    handleDeleteSelectedSalaries: PropTypes.func,
    handleDeleteAllSalaries: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  getColumns = () => {
    const columns: any[] = [
      {
        key: 'approved',
        render: (text: any, record: AnyRecord) => {
          if (record.approvedOn) {
            let tooltip = 'Approved';
            if (record.approver) {
              tooltip = `Approved By ${record.approver.name}`;
            }

            return (
              <AntTooltip title={tooltip}>
                <AntCheckCircleTwoTone
                  style={IconStyle}
                  twoToneColor="#52c41a"
                />
              </AntTooltip>
            );
          }

          return (
            <AntTooltip title="Not Approved">
              <AntWarningTwoTone
                style={IconStyle}
                twoToneColor="orange"
              />
            </AntTooltip>
          );
        },
      },
      {
        title: 'Name',
        key: 'name',
        render: (_text: any, record: AnyRecord) => (
          <KarkunNameDisplay
            karkun={record.karkun}
            onKarkunNameClicked={this.props.handleItemSelected}
          />
        ),
      },
      {
        title: 'Salary',
        dataIndex: 'salary',
        key: 'salary',
        render: (text: any, record: AnyRecord) => {
          if (record.salary !== record.prevSalary) {
            const tooltip = `Last month Salary value was ${record.prevSalary}`;
            return (
              <AntTooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </AntTooltip>
            );
          }
          return text;
        },
      },
      {
        title: 'Rashan',
        dataIndex: 'rashanMadad',
        key: 'rashanMadad',
        render: (text: any, record: AnyRecord) => {
          if (record.rashanMadad !== record.prevRashanMadad) {
            const tooltip = `Last month Rashan value was ${record.prevRashanMadad}`;
            return (
              <AntTooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </AntTooltip>
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
        render: (text: any, record: AnyRecord) => {
          if (record.otherDeduction !== record.prevOtherDeduction) {
            const tooltip = `Last month Other Deduction value was ${record.prevOtherDeduction}`;
            return (
              <AntTooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </AntTooltip>
            );
          }
          return text;
        },
      },
      {
        title: 'Arrears',
        dataIndex: 'arrears',
        key: 'arrears',
        render: (text: any, record: AnyRecord) => {
          if (record.arrears !== record.prevArrears) {
            const tooltip = `Last month Arrears value was ${record.prevArrears}`;
            return (
              <AntTooltip title={tooltip}>
                <span style={{ fontWeight: 'bold', color: 'orange' }}>
                  {text}
                </span>
              </AntTooltip>
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
      render: (text: any, record: AnyRecord) => {
        const { handleEditSalary, handleDeleteSelectedSalaries } = this.props;
        return (
          <div className="list-actions-column">
            <AntTooltip title="Edit">
              <AntEditOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleEditSalary(record);
                }}
              />
            </AntTooltip>
            <AntPopconfirm
              title="Are you sure you want to delete this salary record?"
              onConfirm={() => {
                handleDeleteSelectedSalaries([record]);
              }}
              okText="Yes"
              cancelText="No"
            >
              <AntTooltip title="Delete">
                <AntDeleteOutlined className="list-actions-icon" />
              </AntTooltip>
            </AntPopconfirm>
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
    const rows = sortedSalariesByMonth.map(
      (salary: AnyRecord) => {
        const bankAccountDetails = (salary.karkun.bankAccountDetails || '').replace('\n', ' - ');
        return `${salary.karkun.name}, ${salary.karkun.parentName}, ${salary.karkun.cnicNumber}, ${salary.karkun.contactNumber1}, ${salary.job.name}, ${bankAccountDetails}, ${salary.salary}, ${salary.openingLoan}, ${salary.loanDeduction}, ${salary.newLoan}, ${salary.closingLoan}, ${salary.otherDeduction}, ${salary.arrears}, ${salary.netPayment}`
      }
    );
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
      AntModal.confirm({
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
      AntModal.confirm({
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
      <AntSelect.Option key={job._id} value={job._id}>
        {job.name}
      </AntSelect.Option>
    ));

    return (
      <AntSelect
        defaultValue={selectedJobId}
        style={SelectStyle}
        onChange={this.handleSelectionChange}
        allowClear
        dropdownMatchSelectWidth
      >
        {options}
      </AntSelect>
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
              <AntDeleteOutlined />&nbsp;
              Delete Selected Salaries
            </>
          ),
          onClick: this._handleDeleteSelectedSalaries,
        },
        {
          key: '9',
          label: (
            <>
              <AntDeleteOutlined />&nbsp;
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
            <AntPlusCircleOutlined />&nbsp;
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
            <AntCheckCircleOutlined />&nbsp;
            Approve Selected Salaries
          </>
        ),
        onClick: this._handleApproveSelectedSalaries,
      },
      {
        key: '2-2',
        label: (
          <>
            <AntCheckCircleOutlined />&nbsp;
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
            <AntFileExcelOutlined />&nbsp;
            Download as CSV
          </>
        ),
        onClick: this.handleDownloadAsCSV,
      },
      {
        key: '4',
        label: (
          <>
            <AntPrinterOutlined />&nbsp;
            Print Salary Receipts
          </>
        ),
        onClick: this.handlePrintSalaryReceipts,
      },
      {
        key: '5',
        label: (
          <>
            <AntPrinterOutlined />&nbsp;
            Print Rashan Receipts
          </>
        ),
        onClick: this.handlePrintRashanReceipts,
      },
      {
        key: '6',
        label: (
          <>
            <AntPrinterOutlined />&nbsp;
            Print Eid Receipts
          </>
        ),
        onClick: this.handlePrintEidReceipts,
      },
      ...deleteMenuItems,
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
          {this.getJobSelector()}
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

  getSortedSalaries = memoize((currentSalaries, prevSalaries) => {
    const prevSalariesMap = keyBy(prevSalaries ?? [], 'karkunId');
    const sortedCurrentSalaries = sortBy(currentSalaries ?? [], 'karkun.name');
    return sortedCurrentSalaries.map((currentSalary: AnyRecord) => {
      const prevSalary = prevSalariesMap[currentSalary.karkunId];
      return Object.assign({}, currentSalary, {
        prevSalary: prevSalary ? prevSalary.salary : 0,
        prevOtherDeduction: prevSalary ? prevSalary.otherDeduction : 0,
        prevArrears: prevSalary ? prevSalary.arrears : 0,
        prevRashanMadad: prevSalary ? prevSalary.rashanMadad : 0,
      });
    });
  });

  render() {
    const { currentSalaries, prevSalaries } = this.props;
    const sortedSalariesByMonth = this.getSortedSalaries(
      currentSalaries,
      prevSalaries
    );

    return (
      <AntTable
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
    ...prevQueryResult
  } = useQuery(PREV_MONTH_SALARIES as any, {
    variables: {
      month: previousMonth.format(Formats.DATE_FORMAT),
      jobId: selectedJobId,
    },
  });

  const {
    data: currentSalariesData,
    loading: currentSalariesLoading,
    ...currentQueryResult
  } = useQuery(CURRENT_MONTH_SALARIES as any, {
    variables: {
      month: selectedMonth.format(Formats.DATE_FORMAT),
      jobId: selectedJobId,
    },
  });

  return (
    <List
      {...props}
      prevSalariesLoading={prevSalariesLoading}
      prevSalaries={
        prevSalariesData ? (prevSalariesData as QueryData).salariesByMonth : undefined
      }
      currentSalariesLoading={currentSalariesLoading}
      currentSalaries={
        currentSalariesData
          ? (currentSalariesData as QueryData).salariesByMonth
          : undefined
      }
      prevSalariesQuery={prevQueryResult}
      currentSalariesQuery={currentQueryResult}
    />
  );
};

ListWithSalaries.propTypes = {
  selectedMonth: PropTypes.object,
  selectedJobId: PropTypes.string,
};

export default ListWithSalaries;
