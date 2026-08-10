import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import numeral from 'numeral';
import {
  Button,
  Dropdown,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  Space,
  Spin,
} from 'antd';
import { message, modal } from '/imports/ui/antd-feedback';
import {
  CalculatorOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  MergeCellsOutlined,
  PlusCircleOutlined,
  ReconciliationOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import {
  groupBy,
  kebabCase,
  noop,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type { PagedStockItemsQuery } from 'meteor/idreesia-common/types/client-operations';
import { StockItemName } from '/imports/ui/modules/stores/common/controls';
import ListFilter, {
  StockItemsFilterChips,
  type PageParams,
} from './list-filter';
import {
  MERGE_ATOCK_ITEMS,
  PAGED_STOCK_ITEMS,
  RECALCULATE_STOCK_LEVELS,
  REMOVE_STOCK_ITEM,
  VERIFY_STOCK_ITEM,
} from '../gql';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

const MinStockLevelStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
};

const StockLevelVerificationOk: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
};

const StockLevelVerificationWarning: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  color: 'orange',
  cursor: 'pointer',
};

const StockLevelVerificationError: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  color: 'red',
  cursor: 'pointer',
};

const GroupNameDivStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  color: '#1890ff',
  fontWeight: 'bold',
};

type StockItemRow = NonNullable<
  NonNullable<
    NonNullable<PagedStockItemsQuery['pagedStockItems']>['data']
  >[number]
>;

type TreeStockItemRow = StockItemRow & {
  isGroup?: boolean;
  noParent?: boolean;
  children?: TreeStockItemRow[];
};

interface Props {
  pageIndex: number;
  pageSize: number;
  physicalStoreId: string;
  name?: string;
  categoryId?: string;
  verifyDuration?: string;
  stockLevel?: string;
  setPageParams(params: PageParams): void;
  handleItemSelected?(stockItem: StockItemRow): void;
  showNewButton?: boolean;
  showSelectionColumn?: boolean;
  showActions?: boolean;
  handleNewClicked?(): void;
}

const List = ({
  pageIndex,
  pageSize,
  physicalStoreId,
  name,
  categoryId,
  verifyDuration,
  stockLevel,
  setPageParams,
  handleItemSelected = noop,
  showNewButton,
  showSelectionColumn,
  showActions,
  handleNewClicked = noop,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [selectedRowsById, setSelectedRowsById] = useState<
    Record<string, StockItemRow>
  >({});

  const { data, loading, refetch: refetchListQuery } = useQuery(
    PAGED_STOCK_ITEMS,
    {
      variables: {
        physicalStoreId,
        queryString: `?categoryId=${categoryId || ''}&name=${
          name || ''
        }&verifyDuration=${verifyDuration || ''}&stockLevel=${
          stockLevel || ''
        }&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
      skip: !physicalStoreId,
    }
  );

  const [removeStockItem] = useMutation(REMOVE_STOCK_ITEM, {
    refetchQueries: ['pagedStockItems'],
  });
  const [mergeStockItems] = useMutation(MERGE_ATOCK_ITEMS, {
    refetchQueries: ['pagedStockItems'],
  });
  const [recalculateStockLevels] = useMutation(RECALCULATE_STOCK_LEVELS, {
    refetchQueries: ['pagedStockItems'],
  });
  const [verifyStockItemLevel] = useMutation(VERIFY_STOCK_ITEM, {
    refetchQueries: ['pagedStockItems'],
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

  const selectedRows = Object.values(selectedRowsById);

  const handleDeleteClicked = (stockItem: StockItemRow) => {
    if (!stockItem._id) return;
    removeStockItem({
      variables: {
        _id: stockItem._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock item has been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleMergeClicked = () => {
    if (selectedRows.length <= 1) return;

    const _ids = selectedRows
      .map((row) => row._id)
      .filter((id): id is string => Boolean(id));
    if (_ids.length <= 1) return;

    mergeStockItems({
      variables: {
        _idToKeep: _ids[0],
        _idsToMerge: _ids.slice(1),
        physicalStoreId,
      },
    })
      .then(() => {
        setSelectedRowsById({});
        message.success('Stock items have been merged.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleRecalculateClicked = () => {
    if (selectedRows.length === 0) return;

    const _ids = selectedRows
      .map((row) => row._id)
      .filter((id): id is string => Boolean(id));
    if (_ids.length === 0) return;

    recalculateStockLevels({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock levels have been recalculated.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleVerifyStockLevel = (record: StockItemRow) => {
    if (!record._id) return;
    const currentStockLevelDisplay = record.currentStockLevel
      ? numeral(record.currentStockLevel).format('0.00')
      : '0';
    modal.confirm({
      title: 'Stock Level Verification',
      content: `Have you verified that the current stock level of "${
        record.name
      }" is ${currentStockLevelDisplay}?`,
      onOk() {
        verifyStockItemLevel({
          variables: {
            _id: record._id as string,
            physicalStoreId,
          },
        })
          .then(() => {
            message.success(
              `Verification date for stock level of "${record.name}" was set.`,
              5
            );
          })
          .catch((error: Error) => {
            message.error(error.message, 5);
          });
      },
    });
  };

  const handleExportSelected = () => {
    const url = `${
      window.location.origin
    }/generate-report?reportName=StockItems&reportArgs=${physicalStoreId}`;
    window.open(url, '_blank');
  };

  const onChange = (nextPageIndex: number, nextPageSize: number) => {
    setPageParams({
      pageIndex: nextPageIndex - 1,
      pageSize: nextPageSize,
    });
  };

  const handleAction = ({ key }: { key: string }) => {
    if (key === 'merge') {
      if (selectedRows.length <= 1) {
        message.info('You need to select multiple stock items to merge.', 5);
        return;
      }

      modal.confirm({
        title: 'Merge selected items',
        content:
          'Are you sure you want to merge these items? This cannot be undone.',
        onOk: handleMergeClicked,
        onCancel() {},
      });
    } else if (key === 'recalculate') {
      handleRecalculateClicked();
    } else if (key === 'export') {
      handleExportSelected();
    }
  };

  const getTreeData = (rows: StockItemRow[]): TreeStockItemRow[] => {
    const treeData: TreeStockItemRow[] = [];
    const groupedData = groupBy(rows, 'name');
    const itemNames = Object.keys(groupedData);
    itemNames.forEach((itemName: string, index: number) => {
      const items = groupedData[itemName].filter(
        (item): item is StockItemRow => item != null
      );
      if (items.length === 1) {
        treeData.push({
          ...items[0],
          noParent: true,
        });
      } else {
        treeData.push({
          _id: `${index}-${kebabCase(itemName)}`,
          name: `${itemName} (${items.length} items)`,
          isGroup: true,
          children: items,
        } as TreeStockItemRow);
      }
    });

    return treeData;
  };

  const getColumns = () => {
    const columns: any[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        // Keep room for avatar + label; without a width, fixed sibling
        // columns crush this cell in the selection drawer.
        width: 220,
        ellipsis: true,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: showActions ? 7 : 6 } : { colSpan: 1 },
        render: (_text: unknown, record: TreeStockItemRow) => {
          if (record.isGroup) {
            return <div style={GroupNameDivStyle}>{record.name}</div>;
          }

          const paddingLeft = record.noParent ? 0 : 20;
          return (
            <div style={{ paddingLeft, overflow: 'hidden' }}>
              <StockItemName
                stockItem={
                  record._id
                    ? {
                        _id: record._id,
                        physicalStoreId,
                        name: record.name ?? '',
                        imageId: record.imageId ?? undefined,
                      }
                    : null
                }
                onStockItemNameClicked={() => handleItemSelected(record)}
              />
            </div>
          );
        },
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        width: 120,
        ellipsis: true,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        width: 120,
        ellipsis: true,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
      },
      {
        title: 'Category',
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 120,
        ellipsis: true,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
      },
      {
        title: 'Min Stock',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel',
        width: 100,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
        render: (text: number, record: TreeStockItemRow) => {
          let stockLevelVal = text ? numeral(text).format('0.00') : '';
          if (stockLevelVal && record.unitOfMeasurement !== 'quantity') {
            stockLevelVal = `${stockLevelVal} ${record.unitOfMeasurement}`;
          }

          return <div style={MinStockLevelStyle}>{stockLevelVal}</div>;
        },
      },
      {
        title: 'Current Stock',
        dataIndex: 'currentStockLevel',
        key: 'currentStockLevel',
        width: 120,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
        render: (text: number, record: TreeStockItemRow) => {
          let stockLevelVal = text ? numeral(text).format('0.00') : '';
          if (stockLevelVal && record.unitOfMeasurement !== 'quantity') {
            stockLevelVal = `${stockLevelVal} ${record.unitOfMeasurement}`;
          }

          let style: CSSProperties = StockLevelVerificationError;
          let tooltip = 'Stock level has never been verified.';

          if (record.verifiedOn) {
            const now = dayjs();
            const lastVerified = dayjs(Number(record.verifiedOn));
            const duration = dayjs.duration(now.diff(lastVerified)).asMonths();
            tooltip = `Stock level verified on ${lastVerified.format(
              Formats.DATE_FORMAT
            )}`;
            if (duration < 3) {
              style = StockLevelVerificationOk;
            } else if (duration < 6) {
              style = StockLevelVerificationWarning;
            }
          }

          return (
            <Tooltip title={tooltip}>
              <div style={style}>{stockLevelVal}</div>
            </Tooltip>
          );
        },
      },
    ];

    if (showActions) {
      columns.push({
        title: 'Actions',
        key: 'action',
        width: 90,
        onCell: (record: TreeStockItemRow) =>
          record.isGroup ? { colSpan: 0 } : { colSpan: 1 },
        render: (_text: unknown, record: TreeStockItemRow) => {
          const {
            purchaseFormsCount = 0,
            issuanceFormsCount = 0,
            stockAdjustmentsCount = 0,
          } = record;

          const verifyAction = (
            <Tooltip title="Verify Stock Level">
              <ReconciliationOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleVerifyStockLevel(record);
                }}
              />
            </Tooltip>
          );

          let deleteAction;

          if (
            (purchaseFormsCount ?? 0) +
              (issuanceFormsCount ?? 0) +
              (stockAdjustmentsCount ?? 0) ===
            0
          ) {
            deleteAction = (
              <Popconfirm
                title="Are you sure you want to delete this stock item?"
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
            );
          }

          return (
            <div className="list-actions-column">
              {verifyAction}
              {deleteAction}
            </div>
          );
        },
      });
    }

    return columns;
  };

  const getActionsMenu = () => {
    const items = [
      {
        key: 'merge',
        label: 'Merge Selected',
        icon: <MergeCellsOutlined />,
      },
      {
        key: 'recalculate',
        label: 'Recalculate Selected',
        icon: <CalculatorOutlined />,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'export',
        label: 'Export Current Stock Levels',
        icon: <FileExcelOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: handleAction }}>
        <Button icon={<SettingOutlined />} title="Actions" />
      </Dropdown>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pagedStockItems = data?.pagedStockItems;
  const totalResults = pagedStockItems?.totalResults ?? 0;
  const rows = (pagedStockItems?.data ?? []).filter(
    (row): row is StockItemRow => row != null
  );
  const treeData = getTreeData(rows);
  const numPageIndex = pageIndex + 1;

  const filterProps = {
    name,
    physicalStoreId,
    categoryId,
    verifyDuration,
    stockLevel,
    setPageParams,
    refreshData: refetchListQuery,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        {showNewButton ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Stock Item
          </Button>
        ) : null}
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
          {getActionsMenu()}
        </Space>
        <StockItemsFilterChips {...filterProps} />
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={treeData}
        columns={getColumns()}
        bordered
        indentSize={30}
        size="middle"
        tableLayout="fixed"
        pagination={false}
        title={getTableHeader}
        scroll={{ y: scrollY }}
        rowSelection={
          showSelectionColumn
            ? {
                checkStrictly: false,
                columnWidth: 48,
                selectedRowKeys: Object.keys(selectedRowsById),
                onChange: (
                  _selectedRowKeys: React.Key[],
                  selectedTreeRows: TreeStockItemRow[]
                ) => {
                  const selectedOnPage = selectedTreeRows.filter(
                    (item): item is StockItemRow =>
                      !item.isGroup && item._id != null
                  );
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
              }
            : undefined
        }
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onChange}
            onShowSizeChange={onChange}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default List;
