import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { PAGED_PURCHASING_REQUISITIONS } from './gql';

export const REQUISITION_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'ordered',
  'cancelled',
];

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.requisitionEditPath(record._id)}>{text}</Link>
      ),
    },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Requested By',
      key: 'requestedBy',
      width: 200,
      render: (_: unknown, record: any) => record.requestedByPerson?.sharedData?.name ?? '',
    },
    {
      title: 'Needed By',
      dataIndex: 'neededBy',
      key: 'neededBy',
      width: 140,
      render: formatDate,
    },
    {
      title: 'Estimated Total',
      dataIndex: 'estimatedTotal',
      key: 'estimatedTotal',
      width: 150,
      align: 'right' as const,
      render: formatMoney,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <DocumentList
      {...props}
      breadcrumbs={['Purchasing', 'Requisitions']}
      query={PAGED_PURCHASING_REQUISITIONS}
      dataKey="pagedPurchasingRequisitions"
      columns={columns}
      noun="requisitions"
      searchPlaceholder="Search number or title"
      statuses={REQUISITION_STATUSES}
      newButton={
        can(Permissions.PURCHASING_MANAGE_REQUISITIONS)
          ? {
              label: 'New Requisition',
              onClick: () => props.history.push(paths.requisitionNewPath),
            }
          : undefined
      }
    />
  );
};

export default List;
