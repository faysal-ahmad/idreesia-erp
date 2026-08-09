import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Dropdown,
  Pagination,
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
import type { PagedPurchaseFormsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  usePhysicalStore,
  usePhysicalStoreVendors,
} from '/imports/ui/modules/inventory/common/hooks';
import ListFilter from './list-filter';
import {
  APPROVE_PURCHASE_FORMS,
  PAGED_PURCHASE_FORMS,
  REMOVE_PURCHASE_FORMS,
} from '../gql';

type PurchaseFormRow = NonNullable<
  NonNullable<
    NonNullable<PagedPurchaseFormsQuery['pagedPurchaseForms']>['data']
  >[number]
>;

type VendorOption = { _id: string | null; name: string | null; };

type RouteParams = { physicalStoreId: string };
type Props = RouteComponentProps<RouteParams>;

interface RefreshParams {
  approvalStatus?: string[];
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  vendorId?: string;
  pageIndex?: number;
  pageSize?: number;
}

const List = ({ history, location }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } =
    usePhysicalStoreVendors(physicalStoreId);
  const { queryString, queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['showApproved', 'showUnapproved', 'startDate', 'endDate', 'vendorId', 'pageIndex', 'pageSize'],
    paramDefaultValues: { showApproved: 'true', showUnapproved: 'true', vendorId: '', startDate: '', endDate: '' },
  });
  const [selectedRows, setSelectedRows] = useState<PurchaseFormRow[]>([]);

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Purchase Forms', 'List']
      : ['Inventory', 'Purchase Forms', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_PURCHASE_FORMS, {
    variables: { physicalStoreId, queryString },
  });
  const [removePurchaseForms] = useMutation(REMOVE_PURCHASE_FORMS, {
    refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
  });
  const [approvePurchaseForms] = useMutation(APPROVE_PURCHASE_FORMS, {
    refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
  });

  const refreshPage = (newParams: RefreshParams) => {
    const { approvalStatus, startDate, endDate, vendorId, pageIndex, pageSize } = newParams;

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

    const vendorIdVal = Object.prototype.hasOwnProperty.call(newParams, 'vendorId')
      ? (vendorId || '')
      : String(queryParams.vendorId || '');
    const pageIndexVal = Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')
      ? (pageIndex || 0)
      : (queryParams.pageIndex || 0);
    const pageSizeVal = Object.prototype.hasOwnProperty.call(newParams, 'pageSize')
      ? (pageSize || 20)
      : (queryParams.pageSize || 20);
    history.push(`${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&vendorId=${vendorIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`);
  };

  if (loading || vendorsByPhysicalStoreIdLoading) return null;

  const pagedPurchaseForms = data?.pagedPurchaseForms ?? { totalResults: 0, data: [] };
  const rows = (pagedPurchaseForms.data ?? []).filter((row): row is PurchaseFormRow => row != null);
  const pageIndex = queryParams.pageIndex;
  const pageSize = queryParams.pageSize;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Received By',
      dataIndex: ['refReceivedBy', 'name'],
      key: 'refReceivedBy.name',
    },
    {
      title: 'Purchased By',
      dataIndex: ['refPurchasedBy', 'name'],
      key: 'refPurchasedBy.name',
    },
    {
      title: 'Purchase Details',
      key: 'details',
      render: (_text: unknown, record: PurchaseFormRow) => {
        const formattedItems = (record.items ?? []).filter((item) => item != null).map((item) => {
          let quantity: number | string = item.quantity ?? 0;
          if (item.refStockItem?.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${item.refStockItem?.unitOfMeasurement ?? ''}`;
          }
          return (
            <li key={`${item.stockItemId}${item.isInflow}`}>
              {`${item.refStockItem?.name ?? ''} [${quantity} ${item.isInflow ? 'Purchased' : 'Returned'}]`}
            </li>
          );
        });
        const formattedAttachments = (record.attachments ?? []).filter((a) => a != null).map((attachment) => (
          <li key={attachment._id ?? undefined}>{attachment.name}</li>
        ));
        if (formattedAttachments.length > 0) {
          return (<><ul>{formattedItems}</ul><Divider>Attachments</Divider><ul>{formattedAttachments}</ul></>);
        }
        return <ul>{formattedItems}</ul>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: PurchaseFormRow) => {
        const formId = record._id as string;
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Edit"><EditOutlined className="list-actions-icon" onClick={() => history.push(paths.purchaseFormsEditFormPath(physicalStoreId, formId))} /></Tooltip>
              <Tooltip title="Print"><PrinterOutlined className="list-actions-icon" onClick={() => history.push(paths.purchaseFormsPrintFormPath(physicalStoreId, formId))} /></Tooltip>
            </div>
          );
        }
        return (
          <div className="list-actions-column">
            <Tooltip title="View"><FileOutlined className="list-actions-icon" onClick={() => history.push(paths.purchaseFormsViewFormPath(physicalStoreId, formId))} /></Tooltip>
            <Tooltip title="Print"><PrinterOutlined className="list-actions-icon" onClick={() => history.push(paths.purchaseFormsPrintFormPath(physicalStoreId, formId))} /></Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={rows}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <Button size="large" type="primary" icon={<PlusCircleOutlined />} onClick={() => history.push(paths.purchaseFormsNewFormPath(physicalStoreId))}>
            New Purchase Form
          </Button>
          <div className="list-table-header-section">
            <ListFilter
              vendorsByPhysicalStoreId={(vendorsByPhysicalStoreId ?? []) as VendorOption[]}
              refreshPage={refreshPage}
              queryParams={queryParams as Record<string, string | number | boolean | null | undefined | string[]>}
              refreshData={() => refetch()}
            />
            &nbsp;&nbsp;
            <Dropdown menu={{
              items: [
                { key: 'approve', label: 'Approve Selected', icon: <CheckSquareOutlined /> },
                { key: 'export', label: 'Export Selected', icon: <FileExcelOutlined /> },
                { type: 'divider' as const },
                { key: 'delete', label: 'Delete Selected', icon: <DeleteOutlined /> },
              ],
              onClick: ({ key }) => {
                if (selectedRows.length === 0) return;
                const _ids = selectedRows.map((row) => row._id as string);
                if (key === 'approve') {
                  approvePurchaseForms({ variables: { _ids, physicalStoreId } })
                    .then(() => message.success('Purchase forms have been approved.', 5))
                    .catch((error: Error) => message.error(error.message, 5));
                } else if (key === 'export') {
                  window.open(`${window.location.origin}/generate-report?reportName=PurchaseForms&reportArgs=${_ids.join(',')}`, '_blank');
                } else if (key === 'delete') {
                  modal.confirm({
                    title: 'Delete Purchase Forms',
                    content: 'Are you sure you want to delete the selected purchase forms?',
                    onOk: () => removePurchaseForms({ variables: { _ids, physicalStoreId } })
                      .then(() => message.success('Purchase forms have been deleted.', 5))
                      .catch((error: Error) => message.error(error.message, 5)),
                  });
                }
              },
            }}>
              <Button icon={<SettingOutlined />} size="large" />
            </Dropdown>
          </div>
        </div>
      )}
      rowSelection={{ onChange: (_keys, nextRows: PurchaseFormRow[]) => setSelectedRows(nextRows) }}
      size="small"
      pagination={false}
      footer={() => (
        <Pagination
          defaultCurrent={1}
          defaultPageSize={20}
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={(index, size) => refreshPage({ pageIndex: index - 1, pageSize: size })}
          onShowSizeChange={(index, size) => refreshPage({ pageIndex: index - 1, pageSize: size })}
          total={pagedPurchaseForms.totalResults ?? 0}
        />
      )}
    />
  );
};

export default List;
