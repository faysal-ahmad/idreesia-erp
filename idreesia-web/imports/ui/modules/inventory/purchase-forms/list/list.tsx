import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withQuery,
  withMutation,
} from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import dayjs from 'dayjs';
import {
  Button,
  Divider,
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
  SettingOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
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

import ListFilter from './list-filter';
import {
  APPROVE_PURCHASE_FORMS,
  PAGED_PURCHASE_FORMS,
  REMOVE_PURCHASE_FORMS,
} from '../gql';

const AntButton = Button as any;
const AntDivider = Divider as any;
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
  SettingOutlined: SettingOutlined as any,
  PlusCircleOutlined: PlusCircleOutlined as any,
  PrinterOutlined: PrinterOutlined as any,
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
  startDateVal?: string;
  endDateVal?: string;
  vendorId?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}

interface PurchaseItem {
  stockItemId: string;
  quantity: number | string;
  isInflow: boolean;
  refStockItem: {
    name: string;
    unitOfMeasurement?: string;
  };
}

interface Attachment {
  _id: string;
  name: string;
}

interface PurchaseForm {
  _id: string;
  purchaseDate: string;
  approvedOn?: string;
  items?: PurchaseItem[];
  attachments?: Attachment[];
}

interface PagedPurchaseForms {
  totalResults: number;
  data: PurchaseForm[];
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  vendorId?: string;
  pageIndex?: number;
  pageSize?: number;
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
  pagedPurchaseForms?: PagedPurchaseForms;
  removePurchaseForms: MutateFunction;
  approvePurchaseForms: MutateFunction;
}

interface ListState {
  selectedRows: PurchaseForm[];
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
    pagedPurchaseForms: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removePurchaseForms: PropTypes.func,
    approvePurchaseForms: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns: any[] = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Purchased By',
      dataIndex: ['refPurchasedBy', 'name'],
      key: 'refPurchasedByName',
    },
    {
      title: 'For Location',
      dataIndex: ['refLocation', 'name'],
      key: 'refLocationName',
    },
    {
      title: 'Purchase Details',
      key: 'details',
      render: (_text: unknown, record: PurchaseForm) => {
        const { items, attachments } = record;
        const formattedItems = items?.map((item: PurchaseItem) => {
          const key = `${item.stockItemId}${item.isInflow}`;
          let quantity: number | string = item.quantity;
          if (item.refStockItem.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${item.refStockItem.unitOfMeasurement}`;
          }

          return (
            <li key={key}>
              {`${item.refStockItem.name} [${quantity} ${
                item.isInflow ? 'Purchased' : 'Returned'
              }]`}
            </li>
          );
        });

        const formattedAttachments = attachments?.map((attachment: Attachment) => (
          <li key={attachment._id}>{attachment.name}</li>
        ));

        if ((formattedAttachments?.length ?? 0) > 0) {
          return (
            <>
              <ul>{formattedItems}</ul>
              <AntDivider>Attachments</AntDivider>
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
      render: (_text: unknown, record: PurchaseForm) => {
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
              <AntTooltip title="Print">
                <Icons.PrinterOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    this.handlePrintClicked(record);
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
                onClick={() => {
                  this.handlePrintClicked(record);
                }}
              />
            </AntTooltip>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: PurchaseForm[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  refreshPage = (newParams: RefreshParams) => {
    const {
      approvalStatus,
      startDate,
      endDate,
      vendorId,
      pageIndex,
      pageSize,
    } = newParams;
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

    let vendorIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'vendorId')) vendorIdVal = vendorId || '';
    else vendorIdVal = queryParams.vendorId || '';

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&vendorId=${vendorIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsNewFormPath(physicalStoreId));
  };

  handleEditClicked = (record: PurchaseForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsEditFormPath(physicalStoreId, record._id));
  };

  handlePrintClicked = (record: PurchaseForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsPrintFormPath(physicalStoreId, record._id));
  };

  handleViewClicked = (record: PurchaseForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsViewFormPath(physicalStoreId, record._id));
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
        title: 'Delete Purchase Forms',
        content: 'Are you sure you want to delete the selected issuance forms?',
        onOk: () => {
          this.handleDeleteSelected();
        },
      });
    }
  };

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: PurchaseForm) => row._id);
    const { removePurchaseForms, physicalStoreId } = this.props;
    removePurchaseForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Purchase forms have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleApproveSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: PurchaseForm) => row._id);
    const { approvePurchaseForms, physicalStoreId } = this.props;

    approvePurchaseForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Purchase forms have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleExportSelected = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return;

    const reportArgs = selectedRows.map((row: PurchaseForm) => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=PurchaseForms&reportArgs=${reportArgs.join(
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
    const { physicalStoreId, queryParams, refetchListQuery } = this.props;

    return (
      <div className="list-table-header">
        <AntButton
          type="primary"
          icon={<Icons.PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Purchase Form
        </AntButton>
        <div className="list-table-header-section">
          <ListFilterComponent
            physicalStoreId={physicalStoreId}
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
      pagedPurchaseForms = { totalResults: 0, data: [] },
    } = this.props;
    const { totalResults, data } = pagedPurchaseForms;

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

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withMutation(REMOVE_PURCHASE_FORMS, {
    name: 'removePurchaseForms',
    options: {
      refetchQueries: [
        'pagedPurchaseForms',
        'purchaseFormsByStockItem',
        'pagedStockItems',
        'vendorsByPhysicalStoreId',
      ],
    },
  }),
  withMutation(APPROVE_PURCHASE_FORMS, {
    name: 'approvePurchaseForms',
    options: {
      refetchQueries: [
        'pagedPurchaseForms',
        'purchaseFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withQuery(PAGED_PURCHASE_FORMS, {
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
      return `Inventory, ${physicalStore.name}, Purchase Forms, List`;
    }
    return `Inventory, Purchase Forms, List`;
  })
)(List as any);
