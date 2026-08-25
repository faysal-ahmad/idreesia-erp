import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AuditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import type { HrKarkunsPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import ListFilter, {
  KarkunsFilterChips,
  type PageParams,
} from './list-filter';

import { PAGED_HR_KARKUNS, DELETE_HR_KARKUN } from '../gql';

const RouterLink = Link as any;

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type KarkunRow = NonNullable<
  NonNullable<
    NonNullable<HrKarkunsPagedHrKarkunsQuery['pagedHrKarkuns']>['data']
  >[number]
>;

type KarkunDuty = NonNullable<
  NonNullable<NonNullable<KarkunRow['karkunData']>['duties']>[number]
>;

interface Props {
  pageIndex: number;
  pageSize: number;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  dutyId?: string;
  dutyShiftId?: string;
  setPageParams(params: PageParams): void;
  handleItemSelected?(record: KarkunRow): void;
  handlePrintClicked?(record: KarkunRow): void;
  handleAuditLogClicked?(record: KarkunRow): void;
  handleNewClicked?(): void;
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
  dutyId,
  dutyShiftId,
  setPageParams,
  handleItemSelected = noop,
  handleNewClicked = noop,
  handlePrintClicked = noop,
  handleAuditLogClicked,
  handlePrintSelected,
  showNewButton,
  showDownloadButton,
  showSelectionColumn,
  showPhoneNumbersColumn,
  showDutiesColumn,
  showActionsColumn,
  predefinedFilterName,
  predefinedFilterStoreId,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRows, setSelectedRows] = useState<KarkunRow[]>([]);
  const {
    data,
    loading,
    refetch: refetchListQuery,
  } = useQuery(PAGED_HR_KARKUNS, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        dutyId,
        dutyShiftId,
        showVolunteers: 'true',
        showEmployees: 'true',
        predefinedFilterName,
        predefinedFilterStoreId,
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });
  const [deleteHrKarkun] = useMutation(DELETE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns'],
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

  const nameColumn = {
    title: 'Name',
    dataIndex: ['sharedData', 'name'],
    key: 'name',
    render: (_text: unknown, record: KarkunRow) => {
      if (!record._id || !record.sharedData?.name) return null;

      return (
        <KarkunName
          karkun={{
            _id: record._id,
            name: record.sharedData.name,
            imageId: record.sharedData.imageId ?? undefined,
          }}
          onKarkunNameClicked={() => handleItemSelected(record)}
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
    render: (_text: unknown, record: KarkunRow) => {
      const numbers: React.ReactNode[] = [];
      let style: CSSProperties = {};
      const { contactNumber1, contactNumber1Subscribed, contactNumber2, contactNumber2Subscribed } =
        record.sharedData ?? {};
      if (contactNumber1) {
        if (contactNumber1Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (contactNumber1Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <Row key="1">
            <span style={style}>{contactNumber1}</span>
          </Row>
        );
      }

      if (contactNumber2) {
        style = {};
        if (contactNumber2Subscribed === true) {
          style = ContactNumberSubscribed;
        } else if (contactNumber2Subscribed === false) {
          style = ContactNumberNotSubscribed;
        }

        numbers.push(
          <Row key="2">
            <span style={style}>{contactNumber2}</span>
          </Row>
        );
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  const dutiesColumn = {
    title: 'Duties',
    dataIndex: ['karkunData', 'duties'],
    key: 'duties',
    render: (duties: KarkunDuty[] | null | undefined, record: KarkunRow) => {
      const normalizedDuties = (duties ?? []).filter(
        (duty): duty is KarkunDuty => duty != null
      );
      if (normalizedDuties.length === 0 || !record._id) return null;

      const dutyTabLink = `${paths.karkunsEditFormPath(record._id)}?default-active-tab=duties`;
      const dutyNames = normalizedDuties.map((duty, index) => {
        let dutyName = duty.dutyName ?? '';
        if (duty.shiftName) {
          dutyName = `${dutyName} - ${duty.shiftName}`;
        }
        if (duty.role === 'CO') {
          dutyName = `(CO) - ${dutyName}`;
        }

        return (
          <RouterLink key={index} to={dutyTabLink}>
            {dutyName}
          </RouterLink>
        );
      });

      if (dutyNames.length === 1) return dutyNames[0];
      return (
        <>
          {dutyNames.map((link, index) => (
            <Row key={index}>{link}</Row>
          ))}
        </>
      );
    },
  };

  const actionsColumn = {
    key: 'action',
    width: 120,
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
              handleAuditLogClicked?.(record);
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

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows
      .map(row => row._id)
      .filter((id): id is string => Boolean(id));
    const url = `${
      window.location.origin
    }/generate-report?reportName=Karkuns&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
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

  const handleRefresh = () => {
    refetchListQuery().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const getTableHeader = () => {
    const filterProps = {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      dutyId,
      dutyShiftId,
      setPageParams,
      refreshData: refetchListQuery,
    };

    return (
      <div className="list-table-header">
        <Space size={12}>
          {showNewButton ? (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewClicked}
            >
              New Karkun
            </Button>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          <Space size={8}>
            {!predefinedFilterName ? (
              <ListFilter {...filterProps} />
            ) : (
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                title="Reload Data"
              />
            )}
            {getActionsMenu()}
          </Space>
          {!predefinedFilterName ? (
            <KarkunsFilterChips {...filterProps} />
          ) : null}
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

  if (!data?.pagedHrKarkuns) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { totalResults, data: rawKarkuns } = data.pagedHrKarkuns;
  const karkuns = (rawKarkuns ?? []).filter(
    (row): row is KarkunRow => row != null
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
    </div>
  );
};

export default List;
