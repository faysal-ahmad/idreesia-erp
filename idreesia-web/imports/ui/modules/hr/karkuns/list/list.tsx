import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AuditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  message,
} from 'antd';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import ListFilter from './list-filter';

import { PAGED_HR_KARKUNS, DELETE_HR_KARKUN } from '../gql';

const RouterLink = Link as any;
const AntAuditOutlined = AuditOutlined as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntDownloadOutlined = DownloadOutlined as any;
const AntPrinterOutlined = PrinterOutlined as any;
const AntSettingOutlined = SettingOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntBarcodeOutlined = BarcodeOutlined as any;
const AntButton = Button as any;
const AntDropdown = Dropdown as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const KarkunNameControl = KarkunName as any;
const KarkunListFilter = ListFilter as any;
type AnyRecord = Record<string, any>;
interface PagedKarkuns { totalResults: number; karkuns: AnyRecord[]; }
interface QueryData { pagedHrKarkuns?: PagedKarkuns | null; }
interface Props extends Record<string, any> { pageIndex: number; pageSize: number; setPageParams(params: AnyRecord): void; handleItemSelected?(record: AnyRecord): void; handlePrintClicked?(record: AnyRecord): void; handleAuditLogClicked?(record: AnyRecord): void; handleNewClicked?(): void; handleScanClicked?(): void; handlePrintSelected?(records: AnyRecord[]): void; }

const ContactNumberSubscribed = {
  color: 'green',
};

const ContactNumberNotSubscribed = {
  color: 'red',
};

const List = (props: Props) => {
  const [selectedRows, setSelectedRows] = useState<AnyRecord[]>([]);
  const {
    pageIndex,
    pageSize,
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    jobId,
    dutyId,
    dutyShiftId,
    showVolunteers,
    showEmployees,
    setPageParams,
    handleItemSelected,
    showNewButton,
    showDownloadButton,
    showSelectionColumn,
    showPhoneNumbersColumn,
    showDutiesColumn,
    showActionsColumn,
    predefinedFilterName,
    predefinedFilterStoreId,
    handlePrintClicked,
    handleAuditLogClicked,
    handleNewClicked,
    handleScanClicked,
    handlePrintSelected,
  } = props;
  const { data, loading, refetch: refetchListQuery } = useQuery(PAGED_HR_KARKUNS as any, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        lastTarteeb,
        jobId,
        dutyId,
        dutyShiftId,
        showVolunteers,
        showEmployees,
        predefinedFilterName,
        predefinedFilterStoreId,
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });
  const [deleteHrKarkun] = useMutation(DELETE_HR_KARKUN as any, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleDeleteClicked = (record: AnyRecord) => {
    deleteHrKarkun({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map((row: AnyRecord) => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=Karkuns&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  const handlePrintSelectedClick = () => {
    if (selectedRows.length === 0) return;
    handlePrintSelected?.(selectedRows);
  };

  const nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: unknown, record: AnyRecord) => (
      <KarkunNameControl
        karkun={record}
        onKarkunNameClicked={handleItemSelected ?? noop}
      />
    ),
  };

  const cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  const phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: AnyRecord) => {
      const numbers: React.ReactNode[] = [];
      let style: Record<string, string> = {};
      if (record.contactNumber1) {
        if (record.contactNumber1Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (record.contactNumber1Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <AntRow key="1">
            <span style={style as any}>{record.contactNumber1}</span>
          </AntRow>
        );
      }

      if (record.contactNumber2) {
        style = {};
        if (record.contactNumber2Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (record.contactNumber2Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <AntRow key="2">
            <span style={style as any}>{record.contactNumber2}</span>
          </AntRow>
        );
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  const dutiesColumn = {
    title: 'Job / Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: (duties: AnyRecord[] | undefined, record: AnyRecord) => {
      const normalizedDuties = duties ?? [];
      let jobName: React.ReactNode[] = [];
      let dutyNames: React.ReactNode[] = [];

      if (record.job) {
        const jobTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=7`;
        jobName = [<RouterLink to={jobTabLink}>{record.job.name}</RouterLink>];
      }

      if (normalizedDuties.length > 0) {
        const dutyTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=4`;
        dutyNames = normalizedDuties.map((duty: AnyRecord) => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${duty.dutyName} - ${duty.shiftName}`;
          }

          if (duty.role === 'CO') {
            dutyName = `(CO) - ${dutyName}`;
          }

          return <RouterLink to={dutyTabLink}>{dutyName}</RouterLink>;
        });
      }

      const links = jobName.concat(dutyNames);
      if (links.length === 0) {
        return null;
      } else if (links.length === 1) {
        return links[0];
      }
      return (
        <>
          {links.map((link, index) => (
            <AntRow key={index}>{link}</AntRow>
          ))}
        </>
      );
    },
  };

  const actionsColumn = {
    key: 'action',
    render: (_text: unknown, record: AnyRecord) => (
      <div className="list-actions-column">
        <AntTooltip title="Print">
          <AntPrinterOutlined
            className="list-actions-icon"
            onClick={() => {
              handlePrintClicked?.(record);
            }}
          />
        </AntTooltip>
        <AntTooltip title="Audit Log">
          <AntAuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogClicked?.(record);
            }}
          />
        </AntTooltip>
        <AntPopconfirm
          title="Are you sure you want to delete this karkun?"
          onConfirm={() => {
            handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <AntTooltip title="Delete">
            <AntDeleteOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
      </div>
    ),
  };

  const getColumns = () => {
    const columns: any[] = [nameColumn, cnicColumn];

    if (showPhoneNumbersColumn) {
      columns.push(phoneNumberColumn);
    }

    if (showDutiesColumn) {
      columns.push(dutiesColumn);
    }

    if (showActionsColumn) {
      columns.push(actionsColumn);
    }

    return columns;
  };

  const rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: AnyRecord[]) => {
      setSelectedRows(selectedRows);
    },
  };

  const onChange = (pageIndex: number, pageSize?: number) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize: pageSize ?? 20,
    });
  };

  const onShowSizeChange = (pageIndex: number, pageSize?: number) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize: pageSize ?? 20,
    });
  };

  const getActionsMenu = () => {
    if (!showDownloadButton) return null;

    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <AntPrinterOutlined />&nbsp;
            Print Selected
          </>
        ),
        onClick: handlePrintSelectedClick,
      },
      { type: 'divider' },
      {
        key: '2',
        label: (
          <>
            <AntDownloadOutlined />&nbsp;
            Download Selected
          </>
        ),
        onClick: handleExportSelected,
      },
    ];

    return (
      <AntDropdown menu={{ items: menuItems }}>
        <AntButton icon={<AntSettingOutlined />} size="large" />
      </AntDropdown>
    );
  };

  const getTableHeader = () => {
    let newButton = null;
    if (showNewButton) {
      newButton = (
        <div>
          <AntButton
            size="large"
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Karkun
          </AntButton>
          &nbsp;
          <AntButton
            size="large"
            type="secondary"
            icon={<AntBarcodeOutlined />}
            onClick={handleScanClicked}
          >
            Scan Card
          </AntButton>
        </div>
      );
    }

    let listFilter = null;
    if (!predefinedFilterName) {
      listFilter = (
        <KarkunListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          bloodGroup={bloodGroup}
          lastTarteeb={lastTarteeb}
          jobId={jobId}
          dutyId={dutyId}
          dutyShiftId={dutyShiftId}
          showVolunteers={showVolunteers}
          showEmployees={showEmployees}
          setPageParams={setPageParams}
          refreshData={refetchListQuery}
        />
      );
    }

    if (!newButton && !listFilter) return null;
    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          {listFilter}
          &nbsp;&nbsp;
          {getActionsMenu()}
        </div>
      </div>
    );
  };

  if (loading) return null;

  const { totalResults, karkuns } = (data as QueryData).pagedHrKarkuns ?? { totalResults: 0, karkuns: [] };

  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <AntTable
      rowKey="_id"
      dataSource={karkuns}
      columns={getColumns() as any}
      title={getTableHeader}
      rowSelection={showSelectionColumn ? rowSelection : undefined}
      bordered
      size="small"
      pagination={false}
      footer={() => (
        <AntPagination
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  bloodGroup: PropTypes.string,
  lastTarteeb: PropTypes.string,
  jobId: PropTypes.string,
  dutyId: PropTypes.string,
  dutyShiftId: PropTypes.string,
  showVolunteers: PropTypes.string,
  showEmployees: PropTypes.string,
  setPageParams: PropTypes.func,
  handleItemSelected: PropTypes.func,
  showNewButton: PropTypes.bool,
  showDownloadButton: PropTypes.bool,
  showSelectionColumn: PropTypes.bool,
  showPhoneNumbersColumn: PropTypes.bool,
  showDutiesColumn: PropTypes.bool,
  showActionsColumn: PropTypes.bool,
  predefinedFilterName: PropTypes.string,
  predefinedFilterStoreId: PropTypes.string,
  handlePrintClicked: PropTypes.func,
  handleAuditLogClicked: PropTypes.func,
  handleNewClicked: PropTypes.func,
  handleScanClicked: PropTypes.func,
  handlePrintSelected: PropTypes.func,
};

List.defaultProps = {
  handleItemSelected: noop,
  handleNewClicked: noop,
  handleScanClicked: noop,
  handlePrintClicked: noop,
};

export default List;
