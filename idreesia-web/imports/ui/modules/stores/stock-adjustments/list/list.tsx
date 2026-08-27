import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  Button,
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
import type { PagedStockAdjustmentsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, Formats } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';
import { getNameWithImageRenderer } from '/imports/ui/modules/helpers/controls';
import ListFilter, { StockAdjustmentFilterChips } from './list-filter';
import {
  APPROVE_STOCK_ADJUSTMENTS,
  PAGED_STOCK_ADJUSTMENTS,
  REMOVE_STOCK_ADJUSTMENTS,
} from '../gql';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type StockAdjustmentRow = NonNullable<
  NonNullable<
    NonNullable<PagedStockAdjustmentsQuery['pagedStockAdjustments']>['data']
  >[number]
>;

type RouteParams = { physicalStoreId: string };
type Props = RouteComponentProps<RouteParams>;

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  pageIndex?: number;
  pageSize?: number;
}

const List = ({ history, location }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { queryString, queryParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showApproved',
      'showUnapproved',
      'startDate',
      'endDate',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      showApproved: 'true',
      showUnapproved: 'true',
      startDate: '',
      endDate: '',
    },
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRowsById, setSelectedRowsById] = useState<
    Record<string, StockAdjustmentRow>
  >({});

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Stock Adjustments', 'List']
      : [ModuleNames.stores, 'Stock Adjustments', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_STOCK_ADJUSTMENTS, {
    variables: { physicalStoreId, queryString },
  });
  const [removeStockAdjustments] = useMutation(REMOVE_STOCK_ADJUSTMENTS, {
    refetchQueries: [
      'pagedStockAdjustments',
      'stockAdjustmentsByStockItem',
      'pagedStockItems',
    ],
  });
  const [approveStockAdjustments] = useMutation(APPROVE_STOCK_ADJUSTMENTS, {
    refetchQueries: [
      'pagedStockAdjustments',
      'stockAdjustmentsByStockItem',
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
    const { approvalStatus, startDate, endDate, pageIndex, pageSize } =
      newParams;

    let showApprovedVal = String(queryParams.showApproved || 'true');
    let showUnapprovedVal = String(queryParams.showUnapproved || 'true');
    if (Object.prototype.hasOwnProperty.call(newParams, 'approvalStatus')) {
      showApprovedVal =
        approvalStatus?.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus?.indexOf('unapproved') !== -1 ? 'true' : 'false';
    }

    let startDateVal = String(queryParams.startDate || '');
    if (Object.prototype.hasOwnProperty.call(newParams, 'startDate')) {
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    }

    let endDateVal = String(queryParams.endDate || '');
    if (Object.prototype.hasOwnProperty.call(newParams, 'endDate')) {
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    }

    const pageIndexVal = Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')
      ? pageIndex || 0
      : queryParams.pageIndex || 0;
    const pageSizeVal = Object.prototype.hasOwnProperty.call(newParams, 'pageSize')
      ? pageSize || 20
      : queryParams.pageSize || 20;
    history.push(
      `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`
    );
  };

  const selectedRows = Object.values(selectedRowsById);

  const handleAction = ({ key }: { key: string }) => {
    if (selectedRows.length === 0) return;
    const _ids = selectedRows.map((row) => row._id as string);
    if (key === 'approve') {
      approveStockAdjustments({ variables: { _ids, physicalStoreId } })
        .then(() => {
          setSelectedRowsById({});
          message.success('Stock adjustments have been approved.', 5);
        })
        .catch((error: Error) => message.error(error.message, 5));
    } else if (key === 'export') {
      window.open(
        `${window.location.origin}/generate-report?reportName=StockAdjustments&reportArgs=${_ids.join(',')}`,
        '_blank'
      );
    } else if (key === 'delete') {
      modal.confirm({
        title: 'Delete Stock Adjustment Forms',
        content:
          'Are you sure you want to delete the selected stock adjustment forms?',
        onOk: () =>
          removeStockAdjustments({ variables: { _ids, physicalStoreId } })
            .then(() => {
              setSelectedRowsById({});
              message.success('Stock adjustments have been deleted.', 5);
            })
            .catch((error: Error) => message.error(error.message, 5)),
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pagedStockAdjustments = data?.pagedStockAdjustments ?? {
    totalResults: 0,
    data: [],
  };
  const rows = (pagedStockAdjustments.data ?? []).filter(
    (row): row is StockAdjustmentRow => row != null
  );
  const pageIndex = queryParams.pageIndex;
  const pageSize = queryParams.pageSize;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Stock Item',
      dataIndex: 'refStockItem',
      key: 'stockItem',
      render: (_text: unknown, record: StockAdjustmentRow) => {
        const formId = record._id as string;
        const path = record.approvedOn
          ? paths.stockAdjustmentsViewFormPath(physicalStoreId, formId)
          : paths.stockAdjustmentsEditFormPath(physicalStoreId, formId);
        return getNameWithImageRenderer(
          formId,
          record.refStockItem?.imageId ?? undefined,
          record.refStockItem?.formattedName ?? '',
          path,
          'picture'
        );
      },
    },
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 160,
      render: (text: number, record: StockAdjustmentRow) =>
        record.isInflow ? `Increased by ${text}` : `Decreased by ${text}`,
    },
    {
      title: 'Adjustment Date',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      width: 140,
      render: (text: string) =>
        text ? dayjs(Number(text)).format('DD MMM, YYYY') : '',
    },
    {
      title: 'Adjusted By',
      dataIndex: ['refAdjustedBy', 'sharedData', 'name'],
      key: 'adjustedBy',
      width: 160,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 90,
      render: (_text: unknown, record: StockAdjustmentRow) => {
        const formId = record._id as string;
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Edit">
                <EditOutlined
                  className="list-actions-icon"
                  onClick={() =>
                    history.push(
                      paths.stockAdjustmentsEditFormPath(physicalStoreId, formId)
                    )
                  }
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
                onClick={() =>
                  history.push(
                    paths.stockAdjustmentsViewFormPath(physicalStoreId, formId)
                  )
                }
              />
            </Tooltip>
            <Tooltip title="Print">
              <PrinterOutlined className="list-actions-icon" onClick={() => {}} />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const filterProps = {
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
          onClick={() =>
            history.push(paths.stockAdjustmentsNewFormPath(physicalStoreId))
          }
        >
          New Stock Adjustment
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
          <Dropdown
            menu={{
              items: [
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
              ],
              onClick: handleAction,
            }}
          >
            <Button icon={<SettingOutlined />} title="Actions" />
          </Dropdown>
        </Space>
        <StockAdjustmentFilterChips {...filterProps} />
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
          onChange: (_keys, selectedOnPage: StockAdjustmentRow[]) => {
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
            onChange={(index, size) =>
              refreshPage({ pageIndex: index - 1, pageSize: size })
            }
            onShowSizeChange={(index, size) =>
              refreshPage({ pageIndex: index - 1, pageSize: size })
            }
            total={pagedStockAdjustments.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
