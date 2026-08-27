import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Dropdown,
  Pagination,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { message, modal } from '/imports/ui/antd-feedback';
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { PagedIssuanceFormsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, Formats } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
} from '/imports/ui/modules/stores/common/hooks';

import ListFilter, { IssuanceFilterChips } from './list-filter';
import {
  APPROVE_ISSUANCE_FORMS,
  PAGED_ISSUANCE_FORMS,
  REMOVE_ISSUANCE_FORMS,
} from '../gql';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type IssuanceFormRow = NonNullable<
  NonNullable<
    NonNullable<PagedIssuanceFormsQuery['pagedIssuanceForms']>['data']
  >[number]
>;

type RouteParams = {
  physicalStoreId: string;
};

type Props = RouteComponentProps<RouteParams>;

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  locationId?: string;
  pageIndex?: number;
  pageSize?: number;
}

const List = ({ history, location }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId } = usePhysicalStoreLocations(physicalStoreId);
  const { queryString, queryParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showApproved',
      'showUnapproved',
      'locationId',
      'startDate',
      'endDate',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      showApproved: 'true',
      showUnapproved: 'true',
      locationId: '',
      startDate: '',
      endDate: '',
    },
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRowsById, setSelectedRowsById] = useState<
    Record<string, IssuanceFormRow>
  >({});

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Issuance Forms', 'List']
      : [ModuleNames.stores, 'Issuance Forms', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_ISSUANCE_FORMS, {
    variables: { physicalStoreId, queryString },
  });
  const [removeIssuanceForms] = useMutation(REMOVE_ISSUANCE_FORMS, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
    ],
  });
  const [approveIssuanceForms] = useMutation(APPROVE_ISSUANCE_FORMS, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
    ],
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

      setScrollY((prev) =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const refreshPage = (newParams: RefreshParams) => {
    const {
      approvalStatus,
      startDate,
      endDate,
      locationId,
      pageIndex,
      pageSize,
    } = newParams;

    let showApprovedVal;
    let showUnapprovedVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'approvalStatus')) {
      showApprovedVal =
        approvalStatus?.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus?.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = String(queryParams.showApproved || 'true');
      showUnapprovedVal = String(queryParams.showUnapproved || 'true');
    }

    let locationIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'locationId')) {
      locationIdVal = locationId ?? '';
    } else {
      locationIdVal = String(queryParams.locationId || '');
    }

    let startDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'startDate')) {
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    } else {
      startDateVal = String(queryParams.startDate || '');
    }

    let endDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'endDate')) {
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    } else {
      endDateVal = String(queryParams.endDate || '');
    }

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) {
      pageIndexVal = pageIndex || 0;
    } else {
      pageIndexVal = queryParams.pageIndex || 0;
    }

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) {
      pageSizeVal = pageSize || 20;
    } else {
      pageSizeVal = queryParams.pageSize || 20;
    }

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&locationId=${locationIdVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  const handleNewClicked = () => {
    history.push(paths.issuanceFormsNewFormPath(physicalStoreId));
  };

  const handleEditClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsEditFormPath(physicalStoreId, record._id as string));
  };

  const handleViewClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id as string));
  };

  const handlePrintClicked = (record: IssuanceFormRow) => {
    history.push(paths.issuanceFormsPrintFormPath(physicalStoreId, record._id as string));
  };

  const selectedRows = Object.values(selectedRowsById);

  const handleDeleteSelected = () => {
    const _ids = selectedRows.map((row) => row._id as string);
    removeIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        setSelectedRowsById({});
        message.success('Issuance forms have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleApproveSelected = () => {
    const _ids = selectedRows.map((row) => row._id as string);
    approveIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        setSelectedRowsById({});
        message.success('Issuance forms have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleExportSelected = () => {
    const reportArgs = selectedRows.map((row) => row._id as string);
    const url = `${window.location.origin}/generate-report?reportName=IssuanceForms&reportArgs=${reportArgs.join(',')}`;
    window.open(url, '_blank');
  };

  const handleAction = ({ key }: { key: string }) => {
    if (selectedRows.length === 0) return;

    if (key === 'approve') {
      handleApproveSelected();
    } else if (key === 'export') {
      handleExportSelected();
    } else if (key === 'delete') {
      modal.confirm({
        title: 'Delete Issuance Forms',
        content: 'Are you sure you want to delete the selected issuance forms?',
        onOk: () => {
          handleDeleteSelected();
        },
      });
    }
  };

  const onChange = (pageIndex: number, pageSize: number) => {
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pagedIssuanceForms = data?.pagedIssuanceForms ?? { totalResults: 0, data: [] };
  const { totalResults, data: tableData } = pagedIssuanceForms;
  const rows = (tableData ?? []).filter((row): row is IssuanceFormRow => row != null);
  const allLocations = (locationsByPhysicalStoreId ?? []).filter(
    (entry): entry is NonNullable<typeof entry> => entry != null
  );

  const pageIndex = queryParams.pageIndex;
  const pageSize = queryParams.pageSize;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 130,
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Issued To',
      dataIndex: ['refIssuedTo', 'sharedData', 'name'],
      key: 'refIssuedTo.name',
      width: 200,
      render: (text: string, record: IssuanceFormRow) => {
        if (record.handedOverTo) {
          return `${record.handedOverTo} - [on behalf of ${text}]`;
        }
        return text;
      },
    },
    {
      title: 'For Location',
      dataIndex: ['refLocation', 'name'],
      key: 'refLocation.name',
      width: 160,
    },
    {
      title: 'Issuance Details',
      key: 'details',
      render: (_text: unknown, record: IssuanceFormRow) => {
        const row = record;
        const { items, attachments } = row;
        const formattedItems = (items ?? [])
          .filter((item): item is NonNullable<typeof item> => item != null)
          .map((item) => {
            const key = `${item.stockItemId}${item.isInflow}`;
            let quantity: number | string = item.quantity ?? 0;
            if (item.refStockItem?.unitOfMeasurement !== 'quantity') {
              quantity = `${quantity} ${item.refStockItem?.unitOfMeasurement ?? ''}`;
            }
            return (
              <li key={key}>
                {`${item.refStockItem?.name ?? ''} [${quantity} ${item.isInflow ? 'Returned' : 'Issued'}]`}
              </li>
            );
          });

        const formattedAttachments = (attachments ?? [])
          .filter((attachment): attachment is NonNullable<typeof attachment> => attachment != null)
          .map((attachment) => (
            <li key={attachment._id ?? undefined}>{attachment.name}</li>
          ));

        if (formattedAttachments.length > 0) {
          return (
            <>
              <ul>{formattedItems}</ul>
              <Divider>Attachments</Divider>
              <ul>{formattedAttachments}</ul>
            </>
          );
        }

        return <ul>{formattedItems}</ul>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: 90,
      render: (_text: unknown, record: IssuanceFormRow) => {
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Edit">
                <EditOutlined
                  className="list-actions-icon"
                  onClick={() => handleEditClicked(record)}
                />
              </Tooltip>
              <Tooltip title="Print">
                <PrinterOutlined
                  className="list-actions-icon"
                  onClick={() => handlePrintClicked(record)}
                />
              </Tooltip>
            </div>
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title="View">
              <FileOutlined
                className="list-actions-icon"
                onClick={() => handleViewClicked(record)}
              />
            </Tooltip>
            <Tooltip title="Print">
              <PrinterOutlined
                className="list-actions-icon"
                onClick={() => handlePrintClicked(record)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const getActionsMenu = () => {
    const items = [
      {
        key: 'approve',
        label: 'Approve Selected',
        icon: <CheckSquareOutlined />,
      },
      {
        key: 'export',
        label: 'Export Selected',
        icon: <FileExcelOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: 'Delete Selected',
        icon: <DeleteOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: handleAction }}>
        <Button icon={<SettingOutlined />} title="Actions" />
      </Dropdown>
    );
  };

  const filterProps = {
    allLocations,
    refreshPage,
    queryParams,
    refreshData: refetch,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Issuance Form
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
          {getActionsMenu()}
        </Space>
        <IssuanceFilterChips {...filterProps} />
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={rows}
        columns={columns}
        bordered
        title={getTableHeader}
        rowSelection={{
          selectedRowKeys: Object.keys(selectedRowsById),
          columnWidth: 48,
          onChange: (_selectedRowKeys, selectedOnPage: IssuanceFormRow[]) => {
            setSelectedRowsById((prev) => {
              const next = { ...prev };
              rows.forEach((row) => {
                if (row._id) delete next[row._id];
              });
              selectedOnPage.forEach((row) => {
                if (row._id) next[row._id] = row;
              });
              return next;
            });
          },
        }}
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onChange}
            onShowSizeChange={onChange}
            total={totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
