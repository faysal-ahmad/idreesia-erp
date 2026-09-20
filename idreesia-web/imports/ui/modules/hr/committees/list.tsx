import React, { useEffect, useRef, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables,
  CreateCommitteeMutation,
  CreateCommitteeMutationVariables,
  ListAllCommitteesQuery,
  ListAllCommitteesQueryVariables,
  RemoveCommitteeMutation,
  RemoveCommitteeMutationVariables,
  UpdateCommitteeMutation,
  UpdateCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import MSKarkunsList from '/imports/ui/modules/helpers/fields/karkun-selection-input/ms-karkuns-list';

import CommitteeForm, { type CommitteeFormValues } from './committee-form';
import CommitteeMembersPanel, {
  type CommitteeMember,
} from './members-panel';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

const LIST_ALL_COMMITTEES: TypedDocumentNode<
  ListAllCommitteesQuery,
  ListAllCommitteesQueryVariables
> = gql`
  query listAllCommittees {
    allCommittees {
      _id
      name
      color
      description
      karkunIds
      coordinatorKarkunIds
      members {
        _id
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
        }
      }
      coordinators {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;

const CREATE_COMMITTEE: TypedDocumentNode<
  CreateCommitteeMutation,
  CreateCommitteeMutationVariables
> = gql`
  mutation createCommittee(
    $name: String!
    $color: String
    $description: String
  ) {
    createCommittee(name: $name, color: $color, description: $description) {
      _id
      name
    }
  }
`;

const UPDATE_COMMITTEE: TypedDocumentNode<
  UpdateCommitteeMutation,
  UpdateCommitteeMutationVariables
> = gql`
  mutation updateCommittee(
    $id: String!
    $name: String!
    $color: String
    $description: String
  ) {
    updateCommittee(
      id: $id
      name: $name
      color: $color
      description: $description
    ) {
      _id
      name
    }
  }
`;

const REMOVE_COMMITTEE: TypedDocumentNode<
  RemoveCommitteeMutation,
  RemoveCommitteeMutationVariables
> = gql`
  mutation removeCommittee($_id: String!) {
    removeCommittee(_id: $_id)
  }
`;

const ADD_COMMITTEE_MEMBER: TypedDocumentNode<
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables
> = gql`
  mutation addCommitteeMember($committeeId: String!, $karkunId: String!) {
    addCommitteeMember(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

type CommitteeRow = NonNullable<
  NonNullable<ListAllCommitteesQuery['allCommittees']>[number]
> & { _id: string; name: string };

const List = () => {
  useBreadcrumbs(['HR', 'Committees']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<CommitteeFormValues>();
  const [editingCommitteeId, setEditingCommitteeId] = useState<string | null>(
    null
  );
  const [editForm] = Form.useForm<CommitteeFormValues>();

  const { data, loading, refetch } = useQuery(LIST_ALL_COMMITTEES);
  const allCommittees = (data?.allCommittees ?? []).filter(
    (row): row is CommitteeRow =>
      row != null && row._id != null && row.name != null
  );

  const [createCommittee, { loading: creating }] = useMutation(
    CREATE_COMMITTEE,
    { refetchQueries: ['listAllCommittees'] }
  );
  const [updateCommittee, { loading: updating }] = useMutation(
    UPDATE_COMMITTEE,
    { refetchQueries: ['listAllCommittees'] }
  );
  const [removeCommittee] = useMutation(REMOVE_COMMITTEE, {
    refetchQueries: ['listAllCommittees'],
  });
  const [addCommitteeMember] = useMutation(ADD_COMMITTEE_MEMBER, {
    refetchQueries: ['listAllCommittees'],
  });
  const [addMemberCommitteeId, setAddMemberCommitteeId] = useState<
    string | null
  >(null);

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY(prev =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateCommittee = () =>
    newForm
      .validateFields()
      .then(values =>
        createCommittee({
          variables: {
            name: values.name,
            color: values.color,
            description: values.description,
          },
        })
      )
      .then(() => {
        message.success('Committee created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleEditClicked = (record: CommitteeRow) => {
    editForm.setFieldsValue({
      name: record.name,
      color: record.color ?? undefined,
      description: record.description ?? undefined,
    });
    setEditingCommitteeId(record._id);
  };

  const handleCloseEditForm = () => {
    setEditingCommitteeId(null);
    editForm.resetFields();
  };

  const handleUpdateCommittee = () =>
    editForm
      .validateFields()
      .then(values =>
        updateCommittee({
          variables: {
            id: editingCommitteeId as string,
            name: values.name,
            color: values.color,
            description: values.description,
          },
        })
      )
      .then(() => {
        message.success('Committee updated', 2);
        handleCloseEditForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleAddMemberClicked = (record: CommitteeRow) => {
    setAddMemberCommitteeId(record._id);
  };

  const handleCloseAddMemberDrawer = () => {
    setAddMemberCommitteeId(null);
  };

  const handleSelectKarkunForCommittee = (karkun: { _id?: string | null }) => {
    const committeeId = addMemberCommitteeId;
    const karkunId = karkun._id;
    handleCloseAddMemberDrawer();
    if (!committeeId || !karkunId) return;

    addCommitteeMember({ variables: { committeeId, karkunId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleDeleteClicked = (record: CommitteeRow) => {
    removeCommittee({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  const getCommitteeMembers = (record: CommitteeRow): CommitteeMember[] =>
    (record.members ?? [])
      .filter((member): member is NonNullable<typeof member> => member != null)
      .map(member => ({
        _id: member._id as string,
        name: member.sharedData?.name ?? '',
        cnicNumber: member.sharedData?.cnicNumber,
        contactNumber1: member.sharedData?.contactNumber1,
        contactNumber2: member.sharedData?.contactNumber2,
      }));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalResults = allCommittees.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allCommittees.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

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
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => handleEditClicked(record)}
          >
            {text}
          </Button>
          {record.color ? <Tag color={record.color}>&nbsp;</Tag> : null}
        </div>
      ),
    },
    {
      title: 'Coordinators',
      key: 'coordinators',
      render: (_text: unknown, record: CommitteeRow) =>
        (record.coordinators ?? [])
          .filter((coordinator): coordinator is NonNullable<typeof coordinator> =>
            coordinator != null
          )
          .map(coordinator => coordinator.sharedData?.name)
          .filter(Boolean)
          .join(', '),
    },
    {
      title: 'Members',
      key: 'members',
      width: 100,
      render: (_text: unknown, record: CommitteeRow) =>
        record.members?.length ?? 0,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: CommitteeRow) => (
        <div className="list-actions-column">
          <Tooltip title="Add Member">
            <UserAddOutlined
              className="list-actions-icon"
              onClick={() => handleAddMemberClicked(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this committee?"
            onConfirm={() => {
              handleDeleteClicked(record);
            }}
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
          onClick={handleNewClicked}
        >
          New Committee
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
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
          rowKey="_id"
          dataSource={pageData}
          columns={columns}
          title={getTableHeader}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          expandable={{
            expandedRowRender: (record: CommitteeRow) => (
              <CommitteeMembersPanel
                committeeId={record._id}
                members={getCommitteeMembers(record)}
                coordinatorKarkunIds={record.coordinatorKarkunIds}
              />
            ),
          }}
          footer={() => (
            <Pagination
              current={safePageIndex + 1}
              pageSize={pageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={onPaginationChange}
              onShowSizeChange={onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

      <Modal
        title="New Committee"
        open={showNewFormModal}
        width={720}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateCommittee}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <CommitteeForm form={newForm} />
      </Modal>

      <Modal
        title="Edit Committee"
        open={editingCommitteeId != null}
        width={720}
        okText="Save"
        confirmLoading={updating}
        onOk={handleUpdateCommittee}
        onCancel={handleCloseEditForm}
        destroyOnHidden
      >
        <CommitteeForm form={editForm} />
      </Modal>

      <Drawer
        title="Select a Karkun"
        width={800}
        onClose={handleCloseAddMemberDrawer}
        open={addMemberCommitteeId != null}
        destroyOnHidden
      >
        <MSKarkunsList handleSelectItem={handleSelectKarkunForCommittee} />
      </Drawer>
    </>
  );
};

export default List;
