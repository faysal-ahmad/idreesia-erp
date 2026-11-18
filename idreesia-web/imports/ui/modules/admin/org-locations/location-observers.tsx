import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  SyncOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Popconfirm, Row, Space, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  AddOrgLocationObserverMutation,
  AddOrgLocationObserverMutationVariables,
  HrLocationObserverKarkunSearchQuery,
  HrLocationObserverKarkunSearchQueryVariables,
  LocationObserversQuery,
  LocationObserversQueryVariables,
  RemoveOrgLocationObserverMutation,
  RemoveOrgLocationObserverMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  KarkunSelectionList,
  PersonName,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';

const LOCATION_OBSERVERS: TypedDocumentNode<
  LocationObserversQuery,
  LocationObserversQueryVariables
> = gql`
  query locationObservers($_id: String!) {
    orgLocationById(_id: $_id) {
      _id
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

const HR_LOCATION_OBSERVER_KARKUN_SEARCH: TypedDocumentNode<
  HrLocationObserverKarkunSearchQuery,
  HrLocationObserverKarkunSearchQueryVariables
> = gql`
  query hrLocationObserverKarkunSearch($filter: KarkunFilter) {
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

const REFETCH = ['locationObservers', 'orgLocationById'];
const DEFAULT_PAGE_SIZE = 20;

interface ObserverRow {
  _id: string;
  name?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
}

interface Props {
  locationId: string;
}

const LocationObservers = ({ locationId }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(LOCATION_OBSERVERS, {
    variables: { _id: locationId },
  });
  const observers: ObserverRow[] = (data?.orgLocationById?.observers ?? []).flatMap(
    person =>
      person?._id
        ? [
            {
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

  const { data: searchData, loading: searching, refetch: refetchSearch } = useQuery(
    HR_LOCATION_OBSERVER_KARKUN_SEARCH,
    {
      variables: {
        filter: {
          name: filter.name || undefined,
          cnicNumber: filter.cnicNumber || undefined,
          phoneNumber: filter.phoneNumber || undefined,
          // Only karkuns can be observers (enforced server-side).
          isKarkun: true,
          pageIndex: String(pageIndex),
          pageSize: String(pageSize),
        },
      },
      skip: !showAdd,
      fetchPolicy: 'network-only',
    }
  );
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

  const [addObserver] = useMutation(ADD_ORG_LOCATION_OBSERVER, {
    refetchQueries: REFETCH,
  });
  const [removeObserver] = useMutation(REMOVE_ORG_LOCATION_OBSERVER, {
    refetchQueries: REFETCH,
  });

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
    setShowAdd(false);
    setFilter({});
    setPageIndex(0);
  };

  const handleAdd = (karkun: KarkunSelectionItem) => {
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
          <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <div className="list-container">
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

      <Drawer
        title="Add Observer"
        width={900}
        open={showAdd}
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
          selectedIds={observers.map(o => o._id)}
          selectedLabel="Observer"
          addingId={addingId}
          setPageParams={setPageParams}
          refreshData={refetchSearch}
          onAdd={handleAdd}
        />
      </Drawer>
    </>
  );
};

export default LocationObservers;
