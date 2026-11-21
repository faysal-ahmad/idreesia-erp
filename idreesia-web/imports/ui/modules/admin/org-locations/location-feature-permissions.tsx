import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { SyncOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';
import type {
  AddOrgLocationFeatureUserMutation,
  AddOrgLocationFeatureUserMutationVariables,
  OrgLocationFeaturePermissionsQuery,
  OrgLocationFeaturePermissionsQueryVariables,
  HrFeatureUserKarkunSearchQuery,
  HrFeatureUserKarkunSearchQueryVariables,
  RemoveOrgLocationFeatureUserMutation,
  RemoveOrgLocationFeatureUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';

const ORG_LOCATION_FEATURE_PERMISSIONS: TypedDocumentNode<
  OrgLocationFeaturePermissionsQuery,
  OrgLocationFeaturePermissionsQueryVariables
> = gql`
  query orgLocationFeaturePermissions($locationId: String!) {
    orgLocationFeaturePermissions(locationId: $locationId) {
      featureKey
      featureName
      permissions {
        key
        name
        description
        users {
          userId
          personId
          username
          displayName
        }
      }
    }
  }
`;

const HR_FEATURE_USER_KARKUN_SEARCH: TypedDocumentNode<
  HrFeatureUserKarkunSearchQuery,
  HrFeatureUserKarkunSearchQueryVariables
> = gql`
  query hrFeatureUserKarkunSearch($filter: KarkunFilter) {
    pagedHrKarkuns(filter: $filter) {
      totalResults
      data {
        _id
        sharedData {
          name
          parentName
          cnicNumber
          contactNumber1
          imageUrl
          imageThumbnailUrl
        }
      }
    }
  }
`;

const ADD_FEATURE_USER: TypedDocumentNode<
  AddOrgLocationFeatureUserMutation,
  AddOrgLocationFeatureUserMutationVariables
> = gql`
  mutation addOrgLocationFeatureUser(
    $locationId: String!
    $featureKey: String!
    $permissionKey: String!
    $karkunId: String!
  ) {
    addOrgLocationFeatureUser(
      locationId: $locationId
      featureKey: $featureKey
      permissionKey: $permissionKey
      karkunId: $karkunId
    )
  }
`;

const REMOVE_FEATURE_USER: TypedDocumentNode<
  RemoveOrgLocationFeatureUserMutation,
  RemoveOrgLocationFeatureUserMutationVariables
> = gql`
  mutation removeOrgLocationFeatureUser(
    $locationId: String!
    $featureKey: String!
    $permissionKey: String!
    $userId: String!
  ) {
    removeOrgLocationFeatureUser(
      locationId: $locationId
      featureKey: $featureKey
      permissionKey: $permissionKey
      userId: $userId
    )
  }
`;

const REFETCH = ['orgLocationFeaturePermissions', 'myDutiesAttendanceLocations'];
const DEFAULT_PAGE_SIZE = 20;

interface UserEntry {
  userId: string;
  personId?: string | null;
  label: string;
}

interface PermissionRow {
  key: string;
  featureKey: string;
  permissionKey: string;
  name: string;
  description: string;
  users: UserEntry[];
}

interface FeatureRow {
  key: string;
  name: string;
  children: PermissionRow[];
}

interface Props {
  locationId: string;
}

const userLabel = (user: {
  userId?: string | null;
  username?: string | null;
  displayName?: string | null;
}) =>
  user.displayName
    ? `${user.displayName} (${user.username ?? ''})`
    : (user.username ?? user.userId ?? '');

// The enabled features of a location as a tree: each feature, then each of
// its permissions with the users holding it. Managed here, by admins, rather
// than inside the features' workspaces.
const LocationFeaturePermissions = ({ locationId }: Props) => {
  const { containerRef, scrollY } = useListScrollY();
  const [adding, setAdding] = useState<PermissionRow | null>(null);
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(ORG_LOCATION_FEATURE_PERMISSIONS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: searchData,
    loading: searching,
    refetch: refetchSearch,
  } = useQuery(HR_FEATURE_USER_KARKUN_SEARCH, {
    variables: {
      filter: {
        name: filter.name || undefined,
        cnicNumber: filter.cnicNumber || undefined,
        phoneNumber: filter.phoneNumber || undefined,
        isKarkun: true,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
    },
    skip: !adding,
    fetchPolicy: 'network-only',
  });
  const [addUser] = useMutation(ADD_FEATURE_USER, { refetchQueries: REFETCH });
  const [removeUser] = useMutation(REMOVE_FEATURE_USER, {
    refetchQueries: REFETCH,
  });

  const rows: FeatureRow[] = (data?.orgLocationFeaturePermissions ?? []).flatMap(
    feature =>
      feature?.featureKey
        ? [
            {
              key: `feature:${feature.featureKey}`,
              name: feature.featureName ?? feature.featureKey,
              children: (feature.permissions ?? []).flatMap(permission =>
                permission?.key
                  ? [
                      {
                        key: `${feature.featureKey}:${permission.key}`,
                        featureKey: feature.featureKey,
                        permissionKey: permission.key,
                        name: permission.name ?? permission.key,
                        description: permission.description ?? '',
                        users: (permission.users ?? []).flatMap(user =>
                          user?.userId
                            ? [{ userId: user.userId,
                                personId: user.personId,
                                label: userLabel(user),
                              }]
                            : []
                        ),
                      },
                    ]
                  : []
              ),
            },
          ]
        : []
  );

  // The permission being added to, as of the latest data.
  const addingRow = rows
    .flatMap(feature => feature.children)
    .find(row => row.key === adding?.key);

  const karkuns: KarkunSelectionItem[] = (
    searchData?.pagedHrKarkuns?.data ?? []
  ).flatMap(person =>
    person?._id
      ? [
          {
            _id: person._id,
            name: person.sharedData?.name,
            parentName: person.sharedData?.parentName,
            cnicNumber: person.sharedData?.cnicNumber,
            contactNumber1: person.sharedData?.contactNumber1,
            imageUrl: person.sharedData?.imageUrl,
            imageThumbnailUrl: person.sharedData?.imageThumbnailUrl,
          },
        ]
      : []
  );

  const setPageParams = ({
    pageIndex: nextPageIndex,
    pageSize: nextPageSize,
    ...filterChanges
  }: KarkunSelectionPageParams) => {
    if (nextPageIndex != null) setPageIndex(Number(nextPageIndex));
    if (nextPageSize != null) setPageSize(Number(nextPageSize));
    if (Object.keys(filterChanges).length > 0) {
      setFilter(prev => ({ ...prev, ...filterChanges }));
    }
  };

  const handleCloseAdd = () => {
    setAdding(null);
    setFilter({});
    setPageIndex(0);
  };

  const handleAdd = (karkun: KarkunSelectionItem) => {
    if (!adding) return;
    setAddingId(karkun._id);
    addUser({
      variables: {
        locationId,
        featureKey: adding.featureKey,
        permissionKey: adding.permissionKey,
        karkunId: karkun._id,
      },
    })
      .then(() => {
        message.success(`${karkun.name} added to "${adding.name}".`, 3);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  const confirmRemove = (record: PermissionRow, user: UserEntry) => {
    Modal.confirm({
      title: `Remove ${user.label} from "${record.name}"?`,
      content:
        record.permissionKey === 'view'
          ? 'This also removes any other permissions that depend on it.'
          : undefined,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        removeUser({
          variables: {
            locationId,
            featureKey: record.featureKey,
            permissionKey: record.permissionKey,
            userId: user.userId,
          },
        }).catch((error: Error) => {
          message.error(error.message, 5);
        }),
    });
  };

  const isPermission = (record: FeatureRow | PermissionRow): record is PermissionRow =>
    'permissionKey' in record;

  const columns: any[] = [
    {
      title: 'Feature Permissions',
      key: 'name',
      width: '35%',
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <Tooltip title={record.description}>{record.name}</Tooltip>
        ) : (
          <strong>{record.name}</strong>
        ),
    },
    {
      title: 'Users',
      key: 'users',
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <Space size={[4, 4]} wrap>
            {record.users.map(user => (
              <Tag
                key={user.userId}
                closable
                onClose={event => {
                  event.preventDefault();
                  confirmRemove(record, user);
                }}
              >
                {user.label}
              </Tag>
            ))}
          </Space>
        ) : null,
    },
    {
      key: 'action',
      width: 64,
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <div className="list-actions-column">
            <Tooltip title="Add user">
              <UserAddOutlined
                className="list-actions-icon"
                onClick={() => setAdding(record)}
              />
            </Tooltip>
          </div>
        ) : null,
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12} />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            onClick={() =>
              refetch().then(() => {
                message.success('Data Reloaded', 2);
              })
            }
          />
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <div className="list-container" ref={containerRef}>
        <Table
          className="list-table"
          rowKey="key"
          dataSource={rows}
          columns={columns}
          title={getTableHeader}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          // Rows are only rendered once the data is there, so expanding them
          // all by default catches every feature.
          key={data ? 'loaded' : 'loading'}
          expandable={{ defaultExpandAllRows: true }}
          locale={{ emptyText: 'No features enabled' }}
        />
      </div>

      <Drawer
        title={adding ? `Add User to "${adding.name}"` : 'Add User'}
        width={900}
        open={adding != null}
        onClose={handleCloseAdd}
        destroyOnHidden
      >
        <KarkunSelectionList
          karkuns={karkuns}
          totalResults={searchData?.pagedHrKarkuns?.totalResults ?? 0}
          loading={searching}
          pageIndex={pageIndex}
          pageSize={pageSize}
          filter={filter}
          selectedIds={(addingRow?.users ?? []).flatMap(user =>
            user.personId ? [user.personId] : []
          )}
          selectedLabel="Added"
          addingId={addingId}
          setPageParams={setPageParams}
          refreshData={refetchSearch}
          onAdd={handleAdd}
        />
      </Drawer>
    </>
  );
};

export default LocationFeaturePermissions;
