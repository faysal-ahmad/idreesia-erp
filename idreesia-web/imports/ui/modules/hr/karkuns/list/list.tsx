import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
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
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import type { HrKarkunsPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import ListFilter, { type PageParams } from './list-filter';

import { PAGED_HR_KARKUNS, DELETE_HR_KARKUN } from '../gql';

type KarkunRow = NonNullable<
  NonNullable<
    NonNullable<HrKarkunsPagedHrKarkunsQuery['pagedHrKarkuns']>['karkuns']
  >[number]
>;

type KarkunDuty = NonNullable<NonNullable<KarkunRow['duties']>[number]>;

interface Props {
  pageIndex: number;
  pageSize: number;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  lastTarteeb?: string | null;
  jobId?: string | null;
  dutyId?: string | null;
  dutyShiftId?: string | null;
  showVolunteers?: string;
  showEmployees?: string;
  setPageParams(params: PageParams): void;
  handleItemSelected?(record: KarkunRow): void;
  handlePrintClicked?(record: KarkunRow): void;
  handleAuditLogClicked?(record: KarkunRow): void;
  handleNewClicked?(): void;
  handleScanClicked?(): void;
  handlePrintSelected?(records: KarkunRow[]): void;
  showNewButton?: boolean;
  showDownloadButton?: boolean;
  showSelectionColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showDutiesColumn?: boolean;
  showActionsColumn?: boolean;
  predefinedFilterName?: string;
  predefinedFilterStoreId?: string;
}

const ContactNumberSubscribed: CSSProperties = {
  color: 'green',
};

const ContactNumberNotSubscribed: CSSProperties = {
  color: 'red',
};

const List = ({
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
  handleItemSelected = noop,
  showNewButton,
  showDownloadButton,
  showSelectionColumn,
  showPhoneNumbersColumn,
  showDutiesColumn,
  showActionsColumn,
  predefinedFilterName,
  predefinedFilterStoreId,
  handlePrintClicked = noop,
  handleAuditLogClicked = noop,
  handleNewClicked = noop,
  handleScanClicked = noop,
  handlePrintSelected,
}: Props) => {
  const [selectedRows, setSelectedRows] = useState<KarkunRow[]>([]);
  const { data, loading, refetch: refetchListQuery } = useQuery(
    PAGED_HR_KARKUNS,
    {
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
    }
  );
  const [deleteHrKarkun] = useMutation(DELETE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleDeleteClicked = (record: KarkunRow) => {
    if (!record._id) return;
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

    const reportArgs = selectedRows.map((row) => row._id);
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
    render: (_text: unknown, record: KarkunRow) => (
      <KarkunName
        karkun={
          record as Parameters<typeof KarkunName>[0]['karkun']
        }
        onKarkunNameClicked={
          handleItemSelected as Parameters<
            typeof KarkunName
          >[0]['onKarkunNameClicked']
        }
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
    render: (_text: unknown, record: KarkunRow) => {
      const numbers: React.ReactNode[] = [];
      let style: CSSProperties = {};
      if (record.contactNumber1) {
        if (record.contactNumber1Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (record.contactNumber1Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <Row key="1">
            <span style={style}>{record.contactNumber1}</span>
          </Row>
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
          <Row key="2">
            <span style={style}>{record.contactNumber2}</span>
          </Row>
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
    render: (duties: KarkunRow['duties'], record: KarkunRow) => {
      const normalizedDuties = (duties ?? []).filter(
        (duty): duty is KarkunDuty => duty != null
      );
      let jobName: React.ReactNode[] = [];
      let dutyNames: React.ReactNode[] = [];

      if (record.job) {
        const jobTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=7`;
        jobName = [<RouterLink to={jobTabLink}>{record.job.name}</RouterLink>];
      }

      if (normalizedDuties.length > 0) {
        const dutyTabLink = `${paths.karkunsPath}/${record._id}?default-active-tab=4`;
        dutyNames = normalizedDuties.map((duty, index) => {
          let dutyName = duty.dutyName;
          if (duty.shiftName) {
            dutyName = `${duty.dutyName} - ${duty.shiftName}`;
          }

          if (duty.role === 'CO') {
            dutyName = `(CO) - ${dutyName}`;
          }

          return <RouterLink key={index} to={dutyTabLink}>{dutyName}</RouterLink>;
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
            <Row key={index}>{link}</Row>
          ))}
        </>
      );
    },
  };

  const actionsColumn = {
    key: 'action',
    render: (_text: unknown, record: KarkunRow) => (
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
              handleAuditLogClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this karkun?"
          onConfirm={() => {
            handleDeleteClicked(record);
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
    onChange: (_selectedRowKeys: React.Key[], rows: KarkunRow[]) => {
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

  const getActionsMenu = () => {
    if (!showDownloadButton) return null;

    const menuItems = [
      {
        key: '1',
        label: (
          <>
            <PrinterOutlined />&nbsp;
            Print Selected
          </>
        ),
        onClick: handlePrintSelectedClick,
      },
      { type: 'divider' as const },
      {
        key: '2',
        label: (
          <>
            <DownloadOutlined />&nbsp;
            Download Selected
          </>
        ),
        onClick: handleExportSelected,
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }}>
        <Button icon={<SettingOutlined />} size="large" />
      </Dropdown>
    );
  };

  const getTableHeader = () => {
    let newButton = null;
    if (showNewButton) {
      newButton = (
        <div>
          <Button
            size="large"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Karkun
          </Button>
          &nbsp;
          <Button
            size="large"
            type="default"
            icon={<BarcodeOutlined />}
            onClick={handleScanClicked}
          >
            Scan Card
          </Button>
        </div>
      );
    }

    let listFilter = null;
    if (!predefinedFilterName) {
      listFilter = (
        <ListFilter
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

  const { totalResults, karkuns } = data?.pagedHrKarkuns ?? {
    totalResults: 0,
    karkuns: [],
  };

  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <Table
      rowKey="_id"
      dataSource={(karkuns ?? []).filter(
        (row): row is KarkunRow => row != null
      )}
      columns={getColumns() as any}
      title={getTableHeader}
      rowSelection={showSelectionColumn ? rowSelection : undefined}
      bordered
      size="small"
      pagination={false}
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
  );
};

export default List;
