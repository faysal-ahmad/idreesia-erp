import React from 'react';
import { useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { FileOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedStoreRequisitionsQuery } from 'meteor/idreesia-common/types/client-operations';
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
import { formatDate } from '../common/purchasing/format';
import { PAGED_STORE_REQUISITIONS } from './gql';

type Row = NonNullable<
  NonNullable<
    NonNullable<PagedStoreRequisitionsQuery['pagedStoreRequisitions']>['data']
  >[number]
>;

const STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'ordered', 'closed', 'cancelled'];

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
      ? [ModuleNames.stores, physicalStore.name, 'Requisitions', 'List']
      : [ModuleNames.stores, 'Requisitions', 'List']
  );

  const { data, loading, refetch } = useQuery(PAGED_STORE_REQUISITIONS, {
    variables: {
      physicalStoreId,
      search: String(queryParams.search ?? ''),
      status: String(queryParams.status ?? ''),
      pageIndex: Number(queryParams.pageIndex ?? 0),
      pageSize: Number(queryParams.pageSize ?? 20),
    },
  });

  const paged = data?.pagedStoreRequisitions;
  const rows = (paged?.data ?? []).filter((row): row is Row => row != null);

  const refreshPage = (next: DocumentListParams) =>
    history.push(listUrl(location.pathname, queryParams, next));

  const open = (record: Row) =>
    history.push(paths.requisitionsEditFormPath(physicalStoreId, record._id as string));

  const columns = [
    { title: 'Number', dataIndex: 'number', key: 'number', width: 130 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Items',
      key: 'items',
      width: 80,
      render: (_text: unknown, record: Row) => record.lines?.length ?? 0,
    },
    {
      title: 'Needed By',
      dataIndex: 'neededBy',
      key: 'neededBy',
      width: 130,
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Raised By',
      key: 'requestedBy',
      width: 180,
      render: (_text: unknown, record: Row) =>
        record.requestedByPerson?.sharedData?.name ?? '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text: string) => <StatusTag status={text} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 90,
      render: (_text: unknown, record: Row) => (
        <div className="list-actions-column">
          <Tooltip title="View">
            <FileOutlined className="list-actions-icon" onClick={() => open(record)} />
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
      statusOptions={statusOptions(STATUSES)}
      queryParams={queryParams}
      refreshPage={refreshPage}
      refreshData={refetch}
      actions={
        can(Permissions.IN_MANAGE_REQUISITIONS) ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => history.push(paths.requisitionsNewFormPath(physicalStoreId))}
          >
            New Requisition
          </Button>
        ) : null
      }
    />
  );
};

export default List;
