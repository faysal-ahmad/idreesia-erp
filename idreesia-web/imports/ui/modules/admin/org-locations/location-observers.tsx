import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  SyncOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Alert, Button, Popconfirm, Row, Space, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  AddOrgLocationObserverMutation,
  AddOrgLocationObserverMutationVariables,
  PagedOrgLocationObserverKarkunsQuery,
  PagedOrgLocationObserverKarkunsQueryVariables,
  LocationObserversQuery,
  LocationObserversQueryVariables,
  RemoveOrgLocationObserverMutation,
  RemoveOrgLocationObserverMutationVariables,
  SyncOrgLocationObserversMutation,
  SyncOrgLocationObserversMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  PICKER_PERSON_FIELDS,
  PersonName,
  PersonPickerDrawer,
  type PersonSearchSource,
  type PickerPerson,
} from '/imports/ui/modules/helpers/controls';
import ObservedCommitteesDrawer from './observed-committees-drawer';

const LOCATION_OBSERVERS: TypedDocumentNode<
  LocationObserversQuery,
  LocationObserversQueryVariables
> = gql`
  query locationObservers($_id: String!) {
    orgLocationById(_id: $_id) {
      _id
      observerStats {
        karkunId
        observedCommitteeCount
        observedCommitteeIds
      }
      observers {
        _id
        sharedData {
          name
          imageUrl
          imageThumbnailUrl
          contactNumber1
          contactNumber2
        }
      }
    }
  }
`;

const ADD_ORG_LOCATION_OBSERVER: TypedDocumentNode<
  AddOrgLocationObserverMutation,
  AddOrgLocationObserverMutationVariables
> = gql`
  mutation addOrgLocationObserver($locationId: String!, $karkunId: String!) {
    addOrgLocationObserver(locationId: $locationId, karkunId: $karkunId) {
      _id
    }
  }
`;

const REMOVE_ORG_LOCATION_OBSERVER: TypedDocumentNode<
  RemoveOrgLocationObserverMutation,
  RemoveOrgLocationObserverMutationVariables
> = gql`
  mutation removeOrgLocationObserver($locationId: String!, $karkunId: String!) {
    removeOrgLocationObserver(locationId: $locationId, karkunId: $karkunId) {
      _id
    }
  }
`;

const PAGED_ORG_LOCATION_OBSERVER_KARKUNS: TypedDocumentNode<
  PagedOrgLocationObserverKarkunsQuery,
  PagedOrgLocationObserverKarkunsQueryVariables
> = gql`
  query pagedOrgLocationObserverKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedOrgLocationObserverKarkuns(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

const observerKarkunSource: PersonSearchSource<PagedOrgLocationObserverKarkunsQuery> = {
  query: PAGED_ORG_LOCATION_OBSERVER_KARKUNS,
  select: data => data.pagedOrgLocationObserverKarkuns,
  description: 'Showing karkuns of Multan.',
};

const SYNC_ORG_LOCATION_OBSERVERS: TypedDocumentNode<
  SyncOrgLocationObserversMutation,
  SyncOrgLocationObserversMutationVariables
> = gql`
  mutation syncOrgLocationObservers($locationId: String!) {
    syncOrgLocationObservers(locationId: $locationId) {
      committeesChecked
      addedCount
      removedCount
    }
  }
`;

const REFETCH = ['locationObservers', 'orgLocationById'];

interface ObserverRow {
  _id: string;
  name?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  observedCommitteeCount: number;
  observedCommitteeIds: string[];
}

interface Props {
  locationId: string;
}

const LocationObservers = ({ locationId }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [viewedObserverId, setViewedObserverId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(LOCATION_OBSERVERS, {
    variables: { _id: locationId },
  });
  const statsByKarkun = new Map(
    (data?.orgLocationById?.observerStats ?? []).flatMap(stat =>
      stat?.karkunId ? [[stat.karkunId, stat] as const] : []
    )
  );
  const observers: ObserverRow[] = (data?.orgLocationById?.observers ?? []).flatMap(
    person =>
      person?._id
        ? [
            {
              observedCommitteeCount:
                statsByKarkun.get(person._id)?.observedCommitteeCount ?? 0,
              observedCommitteeIds: (
                statsByKarkun.get(person._id)?.observedCommitteeIds ?? []
              ).filter((id): id is string => id != null),
              _id: person._id,
              name: person.sharedData?.name,
              imageUrl: person.sharedData?.imageUrl,
              imageThumbnailUrl: person.sharedData?.imageThumbnailUrl,
              contactNumber1: person.sharedData?.contactNumber1,
              contactNumber2: person.sharedData?.contactNumber2,
            },
          ]
        : []
  );

  const viewedObserver = observers.find(o => o._id === viewedObserverId);

  const [addObserver] = useMutation(ADD_ORG_LOCATION_OBSERVER, {
    refetchQueries: REFETCH,
  });
  const [removeObserver] = useMutation(REMOVE_ORG_LOCATION_OBSERVER, {
    refetchQueries: REFETCH,
  });

  const [syncObservers, { loading: syncing }] = useMutation(
    SYNC_ORG_LOCATION_OBSERVERS,
    { refetchQueries: [
      'locationObservers',
      'locationCommittees',
      'committeeById',
      'committeeMembers',
    ] }
  );

  const handleSync = () => {
    syncObservers({ variables: { locationId } })
      .then(({ data: syncData }) => {
        const result = syncData?.syncOrgLocationObservers;
        message.success(
          `Observers synced across ${result?.committeesChecked ?? 0} committees (${
            result?.addedCount ?? 0
          } added, ${result?.removedCount ?? 0} removed).`,
          4
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleAdd = (karkun: PickerPerson) => {
    setAddingId(karkun._id);
    addObserver({ variables: { locationId, karkunId: karkun._id } })
      .then(() => {
        message.success(`${karkun.name} added as an observer.`, 3);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  const handleRemove = (karkunId: string) => {
    removeObserver({ variables: { locationId, karkunId } }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const columns: any[] = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: ObserverRow) => <PersonName person={record} />,
    },
    {
      title: 'Contact Number',
      key: 'contactNumber',
      render: (_text: unknown, record: ObserverRow) => (
        <>
          {record.contactNumber1 ? <Row>{record.contactNumber1}</Row> : null}
          {record.contactNumber2 ? <Row>{record.contactNumber2}</Row> : null}
        </>
      ),
    },
    {
      title: 'Observed Committees',
      dataIndex: 'observedCommitteeCount',
      key: 'observedCommittees',
      width: 190,
      align: 'center' as const,
      render: (count: number, record: ObserverRow) => (
        <Button type="link" onClick={() => setViewedObserverId(record._id)}>
          {count}
        </Button>
      ),
    },
    {
      key: 'action',
      width: 64,
      render: (_text: unknown, record: ObserverRow) => (
        <div className="list-actions-column">
          <Popconfirm
            title="Remove this person from the observers?"
            onConfirm={() => handleRemove(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Remove">
              <UserDeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setShowAdd(true)}
        >
          Add Observer
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button icon={<TeamOutlined />} loading={syncing} onClick={handleSync}>
            Sync Observers
          </Button>
          <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <div className="list-container">
        <Alert
          type="info"
          showIcon
          message="Observers can observe the data of all committees in the child locations. Use 'Sync Observers' to add them to the committees."
          style={{ marginBottom: 12 }}
        />
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={observers}
          columns={columns}
          title={getTableHeader}
          loading={loading}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'No observers added yet' }}
        />
      </div>

      <ObservedCommitteesDrawer
        open={viewedObserver != null}
        locationId={locationId}
        observerName={viewedObserver?.name}
        observedCommitteeIds={viewedObserver?.observedCommitteeIds ?? []}
        onClose={() => setViewedObserverId(null)}
      />

      <PersonPickerDrawer
        title="Add Observer"
        open={showAdd}
        onClose={() => setShowAdd(false)}
        source={observerKarkunSource}
        selectedIds={observers.map(o => o._id)}
        selectedLabel="Observer"
        showParentName={false}
        addingId={addingId}
        onPick={handleAdd}
      />
    </>
  );
};

export default LocationObservers;
