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
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

import ListFilter from './list-filter';
import {
  APPROVE_ISSUANCE_FORMS,
  PAGED_ISSUANCE_FORMS,
  REMOVE_ISSUANCE_FORMS,
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
  PlusCircleOutlined: PlusCircleOutlined as any,
  PrinterOutlined: PrinterOutlined as any,
  SettingOutlined: SettingOutlined as any,
};
const ListFilterComponent = ListFilter as any;
interface PhysicalStore { name: string; }
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface QueryParams {
  showApproved?: string;
  showUnapproved?: string;
  locationId?: string;
  startDateVal?: string;
  endDateVal?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}
interface IssuanceItem {
  stockItemId: string;
  quantity: number | string;
  isInflow: boolean;
  refStockItem: { name: string; unitOfMeasurement?: string };
  unitOfMeasurement?: string;
}
interface Attachment { _id: string; name: string; }
interface IssuanceForm {
  _id: string;
  issueDate: string;
  handedOverTo?: string;
  approvedOn?: string;
  items: IssuanceItem[];
  attachments?: Attachment[];
}
interface PagedIssuanceForms { totalResults: number; data: IssuanceForm[]; }
interface MutateFunction { (options: { variables: Record<string, unknown> }): Promise<unknown>; }
interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  locationId?: string;
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
  locationsLoading?: boolean;
  locationsByPhysicalStoreId?: unknown[];
  loading?: boolean;
  refetchListQuery?(): void;
  pagedIssuanceForms?: PagedIssuanceForms;
  removeIssuanceForms: MutateFunction;
  approveIssuanceForms: MutateFunction;
}
interface ListState { selectedRows: IssuanceForm[]; }

class List extends Component<ListProps, ListState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedIssuanceForms: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeIssuanceForms: PropTypes.func,
    approveIssuanceForms: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns: any[] = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Issued To',
      dataIndex: ['refIssuedTo', 'name'],
      key: 'refIssuedTo.name',
      render: (text: string, record: IssuanceForm) => {
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
    },
    {
      title: 'Issuance Details',
      key: 'details',
      render: (_text: unknown, record: IssuanceForm) => {
        const { items, attachments } = record;
        const formattedItems = items.map((item: IssuanceItem) => {
          const key = `${item.stockItemId}${item.isInflow}`;
          let quantity: number | string = item.quantity;
          if (item.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${item.refStockItem.unitOfMeasurement}`;
          }

          return (
            <li key={key}>
              {`${item.refStockItem.name} [${quantity} ${
                item.isInflow ? 'Returned' : 'Issued'
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
      render: (_text: unknown, record: IssuanceForm) => {
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
    onChange: (_selectedRowKeys: React.Key[], selectedRows: IssuanceForm[]) => {
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
      locationId,
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

    let locationIdVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'locationId')) locationIdVal = locationId ?? '';
    else locationIdVal = queryParams.locationId || '';

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

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&locationId=${locationIdVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsNewFormPath(physicalStoreId));
  };

  handleEditClicked = (record: IssuanceForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsEditFormPath(physicalStoreId, record._id));
  };

  handleViewClicked = (record: IssuanceForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id));
  };

  handlePrintClicked = (record: IssuanceForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPrintFormPath(physicalStoreId, record._id));
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
        title: 'Delete Issuance Forms',
        content: 'Are you sure you want to delete the selected issuance forms?',
        onOk: () => {
          this.handleDeleteSelected();
        },
      });
    }
  };

  handleApproveSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: IssuanceForm) => row._id);
    const { approveIssuanceForms, physicalStoreId } = this.props;

    approveIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been approved.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  handleExportSelected = () => {
    const { selectedRows } = this.state;
    const reportArgs = selectedRows.map((row: IssuanceForm) => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=IssuanceForms&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
  };

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map((row: IssuanceForm) => row._id);
    const { removeIssuanceForms, physicalStoreId } = this.props;
    removeIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
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
    const { locationsByPhysicalStoreId, queryParams, refetchListQuery } =
      this.props;

    return (
      <div className="list-table-header">
        <AntButton
          size="large"
          type="primary"
          icon={<Icons.PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Issuance Form
        </AntButton>
        <div className="list-table-header-section">
          <ListFilterComponent
            allLocations={locationsByPhysicalStoreId}
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
      pagedIssuanceForms = { totalResults: 0, data: [] },
    } = this.props;
    const { totalResults, data } = pagedIssuanceForms;

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
  WithLocationsByPhysicalStore(),
  withMutation(REMOVE_ISSUANCE_FORMS, {
    name: 'removeIssuanceForms',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withMutation(APPROVE_ISSUANCE_FORMS, {
    name: 'approveIssuanceForms',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withQuery(PAGED_ISSUANCE_FORMS, {
    props: ({ data }: { data: Record<string, any> }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ physicalStoreId, queryString }: { physicalStoreId?: string; queryString?: string }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, List`;
    }
    return `Inventory, Issuance Forms, List`;
  })
)(List as any);
