import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withQuery,
  withMutation,
} from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import dayjs from 'dayjs';
import numeral from 'numeral';
import {
  Button,
  Dropdown,
  Modal,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  message,
} from 'antd';
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
  flowRight,
  groupBy,
  kebabCase,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { StockItemName } from '/imports/ui/modules/inventory/common/controls';
import ListFilter from './list-filter';
import {
  MERGE_ATOCK_ITEMS,
  PAGED_STOCK_ITEMS,
  RECALCULATE_STOCK_LEVELS,
  REMOVE_STOCK_ITEM,
  VERIFY_STOCK_ITEM,
} from '../gql';

const MinStockLevelStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const StockLevelVerificationOk = {
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
};

const StockLevelVerificationWarning = {
  display: 'flex',
  justifyContent: 'center',
  color: 'orange',
  cursor: 'pointer',
};

const StockLevelVerificationError = {
  display: 'flex',
  justifyContent: 'center',
  color: 'red',
  cursor: 'pointer',
};

const GroupNameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  color: '#1890ff',
  fontWeight: 'bold',
};

const AntButton = Button as any;
const AntDropdown = Dropdown as any;
const AntModal = Modal as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const Icons = {
  CalculatorOutlined: CalculatorOutlined as any,
  DeleteOutlined: DeleteOutlined as any,
  FileExcelOutlined: FileExcelOutlined as any,
  MergeCellsOutlined: MergeCellsOutlined as any,
  PlusCircleOutlined: PlusCircleOutlined as any,
  ReconciliationOutlined: ReconciliationOutlined as any,
  SettingOutlined: SettingOutlined as any,
};
const StockItemNameComponent = StockItemName as any;
const ListFilterComponent = ListFilter as any;

interface StockItemRow {
  _id: string;
  physicalStoreId?: string;
  name: string;
  company?: string;
  details?: string;
  categoryName?: string;
  minStockLevel?: number;
  currentStockLevel?: number | string;
  unitOfMeasurement?: string;
  verifiedOn?: string;
  isGroup?: boolean;
  noParent?: boolean;
  imageId?: string;
  purchaseFormsCount?: number;
  issuanceFormsCount?: number;
  stockAdjustmentsCount?: number;
  children?: StockItemRow[];
}

interface PagedStockItems {
  totalResults: number;
  data: StockItemRow[];
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface PageParams {
  pageIndex?: number;
  pageSize?: number;
  categoryId?: string | null;
  name?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
}

interface ListProps {
  pageIndex?: number;
  pageSize?: number;
  physicalStoreId?: string;
  name?: string | null;
  categoryId?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
  setPageParams(params: PageParams): void;
  handleItemSelected?(stockItem: StockItemRow): void;
  showNewButton?: boolean;
  showSelectionColumn?: boolean;
  showActions?: boolean;
  handleNewClicked?(): void;
  removeStockItem: MutateFunction;
  mergeStockItems: MutateFunction;
  recalculateStockLevels: MutateFunction;
  verifyStockItemLevel: MutateFunction;
  loading?: boolean;
  refetchListQuery?(): void;
  pagedStockItems?: PagedStockItems;
}

interface ListState {
  selectedRows: StockItemRow[];
}

class List extends Component<ListProps, ListState> {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    name: PropTypes.string,
    categoryId: PropTypes.string,
    verifyDuration: PropTypes.string,
    stockLevel: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    showSelectionColumn: PropTypes.bool,
    showActions: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    removeStockItem: PropTypes.func,
    mergeStockItems: PropTypes.func,
    recalculateStockLevels: PropTypes.func,
    verifyStockItemLevel: PropTypes.func,

    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    selectedRows: [],
  };

  getColumns = () => {
    const { showActions } = this.props;
    const columns: any[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        onCell: (record: StockItemRow) =>
          record.isGroup ? { colSpan: showActions ? 7 : 6 } : { colSpan: 1 },
        render: (_text: unknown, record: StockItemRow) => {
          if (record.isGroup) {
            return <div style={GroupNameDivStyle}>{record.name}</div>;
          }

          // If it's not a top level item then add indent
          const paddingLeft = record.noParent ? 0 : 20;
          return (
            <div style={{ paddingLeft }}>
              <StockItemNameComponent
                stockItem={record}
                onStockItemNameClicked={this.props.handleItemSelected}
              />
            </div>
          );
        },
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
      },
      {
        title: 'Category',
        dataIndex: 'categoryName',
        key: 'categoryName',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
      },
      {
        title: 'Min Stock',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
        render: (text: number, record: StockItemRow) => {
          let stockLevel = text ? numeral(text).format('0.00') : '';
          if (stockLevel && record.unitOfMeasurement !== 'quantity') {
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;
          }

          return <div style={MinStockLevelStyle}>{stockLevel}</div>;
        },
      },
      {
        title: 'Current Stock',
        dataIndex: 'currentStockLevel',
        key: 'currentStockLevel',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
        render: (text: number, record: StockItemRow) => {
          let stockLevel = text ? numeral(text).format('0.00') : '';
          if (stockLevel && record.unitOfMeasurement !== 'quantity')
            stockLevel = `${stockLevel} ${record.unitOfMeasurement}`;

          let style: any = StockLevelVerificationError;
          let tooltip = `Stock level has never been verified.`;

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
            <AntTooltip title={tooltip}>
              <div style={style}>{stockLevel}</div>
            </AntTooltip>
          );
        },
      },
    ];

    if (showActions) {
      columns.push({
        title: 'Actions',
        key: 'action',
        onCell: (record: StockItemRow) => (record.isGroup ? { colSpan: 0 } : { colSpan: 1 }),
        render: (_text: unknown, record: StockItemRow) => {
          const {
            purchaseFormsCount = 0,
            issuanceFormsCount = 0,
            stockAdjustmentsCount = 0,
          } = record;

          const verifyAction = (
            <AntTooltip title="Verify Stock Level">
              <Icons.ReconciliationOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleVerifyStockLevel(record);
                }}
              />
            </AntTooltip>
          );

          let deleteAction;

          if (
            purchaseFormsCount + issuanceFormsCount + stockAdjustmentsCount ===
            0
          ) {
            deleteAction = (
              <AntPopconfirm
                title="Are you sure you want to delete this stock item?"
                onConfirm={() => {
                  this.handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <AntTooltip title="Delete">
                  <Icons.DeleteOutlined className="list-actions-icon" />
                </AntTooltip>
              </AntPopconfirm>
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

  rowSelection = {
    checkStrictly: false,
    onChange: (_selectedRowKeys: React.Key[], selectedRows: StockItemRow[]) => {
      // Remove any group rows from the selection
      const filteredRows = selectedRows.filter((item: StockItemRow) => !item.isGroup);
      this.setState({
        selectedRows: filteredRows,
      });
    },
  };

  handleDeleteClicked = (stockItem: StockItemRow) => {
    const { physicalStoreId, removeStockItem } = this.props;
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

  handleMergeClicked = () => {
    const { selectedRows } = this.state;
    const { physicalStoreId, mergeStockItems } = this.props;
    if (selectedRows.length <= 1) return;

    const _ids = selectedRows.map(({ _id }: StockItemRow) => _id);
    mergeStockItems({
      variables: {
        _idToKeep: _ids[0],
        _idsToMerge: _ids.slice(1),
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock items have been merged.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleRecalculateClicked = () => {
    const { selectedRows } = this.state;
    const { physicalStoreId, recalculateStockLevels } = this.props;
    if (selectedRows.length === 0) return;

    const _ids = selectedRows.map(({ _id }: StockItemRow) => _id);
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

  handleVerifyStockLevel = (record: StockItemRow) => {
    const { physicalStoreId, verifyStockItemLevel } = this.props;
    let currentStockLevel = record.currentStockLevel;
    currentStockLevel = currentStockLevel
      ? numeral(currentStockLevel).format('0.00')
      : 0;
    AntModal.confirm({
      title: 'Stock Level Verification',
      content: `Have you verified that the current stock level of "${
        record.name
      }" is ${currentStockLevel}?`,
      onOk() {
        verifyStockItemLevel({
          variables: {
            _id: record._id,
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

  handleExportSelected = () => {
    const { physicalStoreId } = this.props;
    const url = `${
      window.location.origin
    }/generate-report?reportName=StockItems&reportArgs=${physicalStoreId}`;
    window.open(url, '_blank');
  };

  onChange = (pageIndex: number, pageSize: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex: number, pageSize: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleAction = ({ key }: { key: string }) => {
    const { selectedRows } = this.state;
    if (key === 'merge') {
      if (selectedRows.length <= 1) {
        message.info('You need to select multiple stock items to merge.', 5);
        return;
      }

      AntModal.confirm({
        title: 'Merge selected items',
        content:
          'Are you sure you want to merge these items? This cannot be undone.',
        onOk: this.handleMergeClicked,
        onCancel() {},
      });
    } else if (key === 'recalculate') {
      this.handleRecalculateClicked();
    } else if (key === 'export') {
      this.handleExportSelected();
    }
  };

  getActionsMenu = () => {
    const items = [
      {
        key: 'merge',
        label: 'Merge Selected',
        icon: <Icons.MergeCellsOutlined />,
      },
      {
        key: 'recalculate',
        label: 'Recalculate Selected',
        icon: <Icons.CalculatorOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'export',
        label: 'Export Current Stock Levels',
        icon: <Icons.FileExcelOutlined />,
      },
    ];

    return (
      <AntDropdown menu={{ items, onClick: this.handleAction }}>
        <AntButton icon={<Icons.SettingOutlined />} size="large" />
      </AntDropdown>
    );
  };

  getTableHeader = () => {
    const {
      name,
      categoryId,
      verifyDuration,
      stockLevel,
      physicalStoreId,
      setPageParams,
      showNewButton,
      handleNewClicked,
      refetchListQuery,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <AntButton
          size="large"
          type="primary"
          icon={<Icons.PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Stock Item
        </AntButton>
      );
    }

    return (
      <div className="list-table-header">
        {newButton}
        <div className="list-table-header-section">
          <ListFilterComponent
            name={name}
            physicalStoreId={physicalStoreId}
            categoryId={categoryId}
            verifyDuration={verifyDuration}
            stockLevel={stockLevel}
            setPageParams={setPageParams}
            refreshData={refetchListQuery}
          />
          &nbsp;&nbsp;
          {this.getActionsMenu()}
        </div>
      </div>
    );
  };

  getTreeData = (data: StockItemRow[]) => {
    const treeData: StockItemRow[] = [];
    // Convert the flat data received from the server into
    // appropriate shape for showing tree in the table
    const groupedData = groupBy(data, 'name');
    const itemNames = Object.keys(groupedData);
    itemNames.forEach((itemName: string, index: number) => {
      // If there is only a single item against the item name
      // then we do not need to show this item in a hierarchy
      const items = groupedData[itemName];
      if (items.length === 1) {
        treeData.push({
          ...items[0],
          noParent: true,
        });
      } else {
        // Insert a parent row under which we will group all the items
        treeData.push({
          _id: `${index}-${kebabCase(itemName)}`,
          name: `${itemName} (${items.length} items)`,
          isGroup: true,
          children: items,
        });
      }
    });

    return treeData;
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      showSelectionColumn,
      pagedStockItems = { totalResults: 0, data: [] },
    } = this.props;
    const { totalResults, data } = pagedStockItems;

    const treeData = this.getTreeData(data);
    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <AntTable
        rowKey="_id"
        dataSource={treeData}
        columns={this.getColumns()}
        bordered
        indentSize={30}
        size="small"
        pagination={false}
        title={this.getTableHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : null}
        footer={() => (
          <AntPagination
            defaultCurrent={1}
            defaultPageSize={20}
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

export default flowRight(
  withQuery(PAGED_STOCK_ITEMS, {
    props: ({ data }: { data: Record<string, any> }) => ({
      refetchListQuery: data.refetch,
      ...data,
    }),
    options: ({
      physicalStoreId,
      categoryId,
      name,
      verifyDuration,
      stockLevel,
      pageIndex,
      pageSize,
    }: Partial<ListProps>) => ({
      variables: {
        physicalStoreId,
        queryString: `?categoryId=${categoryId || ''}&name=${
          name || ''
        }&verifyDuration=${verifyDuration || ''}&stockLevel=${
          stockLevel || ''
        }&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  }),
  withMutation(VERIFY_STOCK_ITEM, {
    name: 'verifyStockItemLevel',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  withMutation(REMOVE_STOCK_ITEM, {
    name: 'removeStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  withMutation(MERGE_ATOCK_ITEMS, {
    name: 'mergeStockItems',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  withMutation(RECALCULATE_STOCK_LEVELS, {
    name: 'recalculateStockLevels',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(List as any);
