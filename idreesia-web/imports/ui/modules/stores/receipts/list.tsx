import React from 'react';
import { useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import { FileOutlined } from '@ant-design/icons';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedStoreReceiptsQuery } from 'meteor/idreesia-common/types/client-operations';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';
import DocumentList, {
  listUrl,
  type DocumentListParams,
} from '../common/purchasing/document-list';
import StatusTag, { statusOptions } from '../common/purchasing/status-tag';
import { formatDate } from '../common/purchasing/format';
import { PAGED_STORE_RECEIPTS } from './gql';

type Row = NonNullable<
  NonNullable<NonNullable<PagedStoreReceiptsQuery['pagedStoreReceipts']>['data']>[number]
>;

type RouteParams = { physicalStoreId: string };

const List = ({ history, location }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['search', 'status', 'pageIndex', 'pageSize'],
    paramDefaultValues: { search: '', status: '' },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Goods Receipts', 'List']
      : [ModuleNames.stores, 'Goods Receipts', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_STORE_RECEIPTS, {
    variables: {
      physicalStoreId,
      search: String(queryParams.search ?? ''),
      status: String(queryParams.status ?? ''),
      pageIndex: Number(queryParams.pageIndex ?? 0),
      pageSize: Number(queryParams.pageSize ?? 20),
    },
  });

  const paged = data?.pagedStoreReceipts;
  const rows = (paged?.data ?? []).filter((row): row is Row => row != null);

  const refreshPage = (next: DocumentListParams) =>
    history.push(listUrl(location.pathname, queryParams, next));

  const columns = [
    { title: 'Receipt', dataIndex: 'number', key: 'number', width: 130 },
    { title: 'Order', dataIndex: 'orderNumber', key: 'orderNumber', width: 130 },
    {
      title: 'Received On',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 130,
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Received By',
      key: 'receivedBy',
      render: (_text: unknown, record: Row) => record.receivedByPerson?.sharedData?.name ?? '',
    },
    { title: 'Delivery Note', dataIndex: 'deliveryNoteNo', key: 'deliveryNoteNo', width: 150 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (text: string) => <StatusTag status={text} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 90,
      render: (_text: unknown, record: Row) => (
        <div className="list-actions-column">
          <Tooltip title="View">
            <FileOutlined
              className="list-actions-icon"
              onClick={() =>
                history.push(paths.goodsReceiptsViewPath(physicalStoreId, record._id as string))
              }
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <DocumentList<Row>
      rows={rows}
      totalResults={paged?.totalResults ?? 0}
      loading={loading}
      columns={columns}
      statusOptions={statusOptions(['posted', 'voided'])}
      queryParams={queryParams}
      refreshPage={refreshPage}
      refreshData={refetch}
    />
  );
};

export default List;
