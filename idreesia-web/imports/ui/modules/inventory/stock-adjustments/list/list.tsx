import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import {
  withQuery,
  withMutation,
} from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import {
  Button,
  Dropdown,
  Modal,
  Pagination,
  Table,
  Tooltip,
  message,
} from 'antd';
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

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import { getNameWithImageRenderer } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';

const AntButton = Button as any;
const AntDropdown = Dropdown as any;
const AntModal = Modal as any;
const AntPagination = Pagination as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const Icons = {
  CheckSquareOutlined: CheckSquareOutlined as any,
  DeleteOutlined: DeleteOutlined as any,
  EditOutlined: EditOutlined as any,
  FileExcelOutlined: FileExcelOutlined as any,
  FileOutlined: FileOutlined as any,
  PlusCircleOutlined: PlusCircleOutlined as any,
  PrinterOutlined: PrinterOutlined as any,
  SettingOutlined: SettingOutlined as any,
};
const ListFilterComponent = ListFilter as any;

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
}

interface QueryParams {
  showApproved?: string;
  showUnapproved?: string;
  startDate?: string;
  startDateVal?: string;
  endDate?: string;
  endDateVal?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}

interface StockAdjustmentRow {
  _id: string;
  physicalStoreId: string;
  quantity: number;
  isInflow: boolean;
  adjustmentDate?: string;
  approvedOn?: string;
  refStockItem: {
    formattedName: string;
    imageId?: string;
  };
}

interface PagedStockAdjustments {
  totalResults: number;
  data: StockAdjustmentRow[];
}

interface MutationFn {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface ListProps {
  history: HistoryLike;
  location: LocationLike;
  queryString?: string;
  queryParams: QueryParams;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  loading?: boolean;
  refetchListQuery?(): void;
  pagedStockAdjustments?: PagedStockAdjustments;
  removeStockAdjustments: MutationFn;
  approveStockAdjustments: MutationFn;
}

interface ListState {
  selectedRows: StockAdjustmentRow[];
}

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  pageIndex?: number;
  pageSize?: number;
}

class List extends Component<ListProps, ListState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedStockAdjustments: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeStockAdjustments: PropTypes.func,
    approveStockAdjustments: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns: any[] = [
    {
      title: 'Stock Item',
      dataIndex: 'refStockItem',
      key: 'stockItem',
      render: (_text: unknown, record: StockAdjustmentRow) => {
        const {
          _id,
          physicalStoreId,
          approvedOn,
          refStockItem: { formattedName, imageId },
        } = record;
        const path = approvedOn
          ? paths.stockAdjustmentsViewFormPath(physicalStoreId, _id)
          : paths.stockAdjustmentsEditFormPath(physicalStoreId, _id);
        return getNameWithImageRenderer(
          _id,
          imageId,
          formattedName,
          path,
          'picture'
        );
      },
    },
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: StockAdjustmentRow) => {
        if (record.isInflow) {
          return `Increased by ${text}`;
        }
        return `Decreased by ${text}`;
      },
    },
    {
      title: 'Adjustment Date',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      render: (text: string) =>
        text ? dayjs(Number(text)).format('DD MMM, YYYY') : '',
    },
    {
      title: 'Adjusted By',
      dataIndex: ['refAdjustedBy', 'name'],
      key: 'adjustedBy',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: StockAdjustmentRow) => {
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <AntTooltip title="Edit">
                <Icons.EditOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    this.handleEditClicked(record);
                  }}
                />
              </AntTooltip>
            </div>
          );
        }

        return (
          <div className="list-actions-column">
            <AntTooltip title="View">
              <Icons.FileOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleViewClicked(record);
                }}
              />
            </AntTooltip>
            <AntTooltip title="Print">
              <Icons.PrinterOutlined
                className="list-actions-icon"
                onClick={() => {}}
              />
            </AntTooltip>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: StockAdjustmentRow[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  refreshPage = (newParams: RefreshParams) => {
    const { approvalStatus, startDate, endDate, pageIndex, pageSize } =
      newParams;
    const { queryParams, history, location } = this.props;

    let showApprovedVal;
    let showUnapprovedVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'approvalStatus')) {
      showApprovedVal =
        approvalStatus?.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus?.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = queryParams.showApproved || 'true';
      showUnapprovedVal = queryParams.showUnapproved || 'true';
    }

    let startDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'startDate'))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    else startDateVal = queryParams.startDateVal || '';

    let endDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'endDate'))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    else endDateVal = queryParams.endDateVal || '';

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockAdjustmentsNewFormPath(physicalStoreId));
  };

  handleEditClicked = (record: StockAdjustmentRow) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsEditFormPath(physicalStoreId, record._id)
    );
  };

  handleViewClicked = (record: StockAdjustmentRow) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsViewFormPath(physicalStoreId, record._id)
    );
  };

  handleAction = ({ key }: { key: string }) => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return;

    if (key === 'approve') {
      this.handleApproveSelected();
    } else if (key === 'export') {
      this.handleExportSelected();
    } else if (key === 'delete') {
      AntModal.confirm({
        title: 'Delete Stock Adjustment Forms',
        content:
          'Are you sure you want to delete the selected stock adjustment forms?',
        onOk: () => {
          this.handleDeleteSelected();
        },
      });
    }
  };

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: StockAdjustmentRow) => row._id);
    const { removeStockAdjustments, physicalStoreId } = this.props;
    removeStockAdjustments({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock adjustments have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleApproveSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: StockAdjustmentRow) => row._id);
    const { approveStockAdjustments, physicalStoreId } = this.props;
    approveStockAdjustments({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock adjustments have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleExportSelected = () => {
    const { selectedRows } = this.state;
    const reportArgs = selectedRows.map((row: StockAdjustmentRow) => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=StockAdjustments&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
  };

  onChange = (pageIndex: number, pageSize: number) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex: number, pageSize: number) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getActionsMenu = () => {
    const items = [
      {
        key: 'approve',
        label: 'Approve Selected',
        icon: <Icons.CheckSquareOutlined />,
      },
      {
        key: 'export',
        label: 'Export Selected',
        icon: <Icons.FileExcelOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete Selected',
        icon: <Icons.DeleteOutlined />,
      },
    ];

    return (
      <AntDropdown menu={{ items, onClick: this.handleAction }}>
        <AntButton icon={<Icons.SettingOutlined />} size="large" />
      </AntDropdown>
    );
  };

  getTableHeader = () => {
    const { queryParams, refetchListQuery } = this.props;

    return (
      <div className="list-table-header">
        <AntButton
          type="primary"
          icon={<Icons.PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Stock Adjustment
        </AntButton>
        <div className="list-table-header-section">
          <ListFilterComponent
            refreshPage={this.refreshPage}
            queryParams={queryParams}
            refreshData={refetchListQuery}
          />
          &nbsp;&nbsp;
          {this.getActionsMenu()}
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedStockAdjustments = { totalResults: 0, data: [] },
    } = this.props;
    const { totalResults, data } = pagedStockAdjustments;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <AntTable
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        rowSelection={this.rowSelection}
        size="small"
        pagination={false}
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

const formMutationRemove = gql`
  mutation removeStockAdjustments($physicalStoreId: String!, $_ids: [String]!) {
    removeStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;

const formMutationApprove = gql`
  mutation approveStockAdjustments(
    $physicalStoreId: String!
    $_ids: [String]!
  ) {
    approveStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      approvedOn
      approvedBy
    }
  }
`;

const listQuery = gql`
  query pagedStockAdjustments($physicalStoreId: String!, $queryString: String) {
    pagedStockAdjustments(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        physicalStoreId
        stockItemId
        adjustmentDate
        adjustedBy
        quantity
        isInflow
        adjustmentReason
        approvedOn
        refStockItem {
          _id
          formattedName
          imageId
        }
        refAdjustedBy {
          _id
          name
        }
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withMutation(formMutationRemove, {
    name: 'removeStockAdjustments',
    options: {
      refetchQueries: [
        'pagedStockAdjustments',
        'stockAdjustmentsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withMutation(formMutationApprove, {
    name: 'approveStockAdjustments',
    options: {
      refetchQueries: [
        'pagedStockAdjustments',
        'stockAdjustmentsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withQuery(listQuery, {
    props: ({ data }: { data: Record<string, any> }) => ({
      refetchListQuery: data.refetch,
      ...data,
    }),
    options: ({
      physicalStoreId,
      queryString,
    }: {
      physicalStoreId?: string;
      queryString?: string;
    }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, List`;
    }
    return `Inventory, Stock Adjustments, List`;
  })
)(List as any);
