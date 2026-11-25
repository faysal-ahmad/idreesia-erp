import React from 'react';
import { useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import { FileOutlined, InboxOutlined } from '@ant-design/icons';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedStoreOrdersQuery } from 'meteor/idreesia-common/types/client-operations';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  useStorePermissions,
} from '/imports/ui/modules/stores/common/hooks';
import DocumentList, {
  listUrl,
  type DocumentListParams,
} from '../common/purchasing/document-list';
import StatusTag, { statusOptions } from '../common/purchasing/status-tag';
import { formatDate, formatQuantity } from '../common/purchasing/format';
import { PAGED_STORE_ORDERS } from './gql';

type Row = NonNullable<
  NonNullable<NonNullable<PagedStoreOrdersQuery['pagedStoreOrders']>['data']>[number]
>;

const STATUSES = ['approved', 'sent', 'partially-received', 'received', 'closed'];
const RECEIVABLE = ['approved', 'sent', 'partially-received'];

type RouteParams = { physicalStoreId: string };

const List = ({ history, location }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { can } = useStorePermissions(physicalStoreId);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['search', 'status', 'pageIndex', 'pageSize'],
    paramDefaultValues: { search: '', status: '' },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Incoming Orders', 'List']
      : [ModuleNames.stores, 'Incoming Orders', 'List']
  );

  const status = String(queryParams.status ?? '');
  const { data, loading, refetch } = useQuery(PAGED_STORE_ORDERS, {
    variables: {
      physicalStoreId,
      search: String(queryParams.search ?? ''),
      statuses: status ? [status] : undefined,
      pageIndex: Number(queryParams.pageIndex ?? 0),
      pageSize: Number(queryParams.pageSize ?? 20),
    },
  });

  const paged = data?.pagedStoreOrders;
  const rows = (paged?.data ?? []).filter((row): row is Row => row != null);
  const canReceive = can(Permissions.IN_MANAGE_RECEIPTS);

  const refreshPage = (next: DocumentListParams) =>
    history.push(listUrl(location.pathname, queryParams, next));

  const columns = [
    { title: 'Order', dataIndex: 'number', key: 'number', width: 130 },
    { title: 'Requisition', dataIndex: 'requisitionNumber', key: 'requisitionNumber', width: 130 },
    { title: 'Vendor', dataIndex: 'vendorName', key: 'vendorName' },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 130,
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Expected',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 130,
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Received',
      key: 'progress',
      width: 130,
      render: (_text: unknown, record: Row) => {
        const lines = (record.lines ?? []).filter(line => line != null);
        const ordered = lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
        const received = lines.reduce((sum, line) => sum + (line.receivedQuantity ?? 0), 0);
        return `${formatQuantity(received)} / ${formatQuantity(ordered)}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (text: string) => <StatusTag status={text} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 90,
      render: (_text: unknown, record: Row) => {
        const orderId = record._id as string;
        return (
          <div className="list-actions-column">
            <Tooltip title="View">
              <FileOutlined
                className="list-actions-icon"
                onClick={() => history.push(paths.incomingOrdersViewPath(physicalStoreId, orderId))}
              />
            </Tooltip>
            {canReceive && RECEIVABLE.includes(record.status ?? '') ? (
              <Tooltip title="Receive Goods">
                <InboxOutlined
                  className="list-actions-icon"
                  onClick={() => history.push(paths.goodsReceiptsNewFormPath(physicalStoreId, orderId))}
                />
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <DocumentList<Row>
      rows={rows}
      totalResults={paged?.totalResults ?? 0}
      loading={loading}
      columns={columns}
      statusOptions={statusOptions(STATUSES)}
      queryParams={queryParams}
      refreshPage={refreshPage}
      refreshData={refetch}
    />
  );
};

export default List;
