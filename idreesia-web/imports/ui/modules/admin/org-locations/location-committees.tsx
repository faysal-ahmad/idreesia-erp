import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  SwapOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Form, Modal, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { message } from '/imports/ui/antd-feedback';

import type {
  CreateLocationCommitteeMutation,
  CreateLocationCommitteeMutationVariables,
  LocationCommitteesQuery,
  LocationCommitteesQueryVariables,
  RemoveLocationCommitteeMutation,
  RemoveLocationCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import MoveCommitteeModal from '../committees/move-committee-modal';
import CommitteeForm, {
  type CommitteeFormValues,
} from '../committees/committee-form';

const LOCATION_COMMITTEES: TypedDocumentNode<
  LocationCommitteesQuery,
  LocationCommitteesQueryVariables
> = gql`
  query locationCommittees($locationId: String!) {
    committeesByLocationId(locationId: $locationId) {
      _id
      name
      color
      memberCount
      guestCount
      observerCount
    }
  }
`;

const CREATE_LOCATION_COMMITTEE: TypedDocumentNode<
  CreateLocationCommitteeMutation,
  CreateLocationCommitteeMutationVariables
> = gql`
  mutation createLocationCommittee(
    $name: String!
    $color: String
    $description: String
    $locationId: String!
  ) {
    createCommittee(
      name: $name
      color: $color
      description: $description
      locationId: $locationId
    ) {
      _id
      name
    }
  }
`;

const REMOVE_LOCATION_COMMITTEE: TypedDocumentNode<
  RemoveLocationCommitteeMutation,
  RemoveLocationCommitteeMutationVariables
> = gql`
  mutation removeLocationCommittee($_id: String!) {
    removeCommittee(_id: $_id)
  }
`;

type CommitteeRow = NonNullable<
  NonNullable<LocationCommitteesQuery['committeesByLocationId']>[number]
> & { _id: string; name: string };

interface Props {
  locationId: string;
}

const LocationCommittees = ({ locationId }: Props) => {
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [movingCommittee, setMovingCommittee] = useState<CommitteeRow | null>(null);
  const [newForm] = Form.useForm<CommitteeFormValues>();

  const { data, loading, refetch } = useQuery(LOCATION_COMMITTEES, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const committees = (data?.committeesByLocationId ?? []).filter(
    (row): row is CommitteeRow => row != null && row._id != null && row.name != null
  );

  // Refetch this list directly (and the workspaces sidebar's committees).
  const [createCommittee, { loading: creating }] = useMutation(
    CREATE_LOCATION_COMMITTEE,
    { refetchQueries: ['myCommittees', 'myCommitteeLocations'] }
  );
  const [removeCommittee] = useMutation(REMOVE_LOCATION_COMMITTEE, {
    refetchQueries: ['myCommittees', 'myCommitteeLocations'],
  });

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreate = () =>
    newForm
      .validateFields()
      .then(values =>
        createCommittee({
          variables: {
            name: values.name,
            color: values.color,
            description: values.description,
            locationId,
          },
        })
      )
      .then(() => refetch())
      .then(() => {
        message.success('Committee created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) message.error(error.message, 5);
      });

  const handleDelete = (record: CommitteeRow) => {
    removeCommittee({ variables: { _id: record._id } })
      .then(() => refetch())
      .catch((error: Error) => {
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
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CommitteeRow) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Link
            to={paths.orgLocationCommitteeEditFormPath(locationId, record._id)}
          >
            {text}
          </Link>
          {record.color ? <Tag color={record.color}>&nbsp;</Tag> : null}
        </div>
      ),
    },
    {
      title: 'Members',
      key: 'members',
      width: 100,
      render: (_text: unknown, record: CommitteeRow) => record.memberCount ?? 0,
    },
    {
      title: 'Guests',
      key: 'guests',
      width: 100,
      render: (_text: unknown, record: CommitteeRow) => record.guestCount ?? 0,
    },
    {
      title: 'Observers',
      key: 'observers',
      width: 100,
      render: (_text: unknown, record: CommitteeRow) => record.observerCount ?? 0,
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: CommitteeRow) => (
        <div className="list-actions-column">
          <Tooltip title="Move to another location">
            <SwapOutlined
              className="list-actions-icon"
              onClick={() => setMovingCommittee(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this committee?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
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
          icon={<PlusCircleOutlined />}
          onClick={() => {
            newForm.resetFields();
            setShowNewFormModal(true);
          }}
        >
          New Committee
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
          dataSource={committees}
          columns={columns}
          title={getTableHeader}
          loading={loading}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
        />
      </div>

      <MoveCommitteeModal
        committee={
          movingCommittee
            ? {
                _id: movingCommittee._id,
                name: movingCommittee.name,
                locationId,
              }
            : null
        }
        onClose={() => setMovingCommittee(null)}
        onMoved={() => setMovingCommittee(null)}
      />

      <Modal
        title="New Committee"
        open={showNewFormModal}
        width={720}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreate}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <CommitteeForm form={newForm} />
      </Modal>
    </>
  );
};

export default LocationCommittees;
