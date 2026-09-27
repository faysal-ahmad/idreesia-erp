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
  AddTeamMemberMutation,
  AddTeamMemberMutationVariables,
  CreateTeamMutation,
  CreateTeamMutationVariables,
  ListAllTeamsQuery,
  ListAllTeamsQueryVariables,
  RemoveTeamMutation,
  RemoveTeamMutationVariables,
  UpdateTeamMutation,
  UpdateTeamMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import MSKarkunsList from '/imports/ui/modules/helpers/fields/karkun-selection-input/ms-karkuns-list';

import TeamForm, { type TeamFormValues } from './team-form';
import TeamMembersPanel, { type TeamMember } from './members-panel';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

const LIST_ALL_TEAMS: TypedDocumentNode<
  ListAllTeamsQuery,
  ListAllTeamsQueryVariables
> = gql`
  query listAllTeams {
    allTeams {
      _id
      name
      color
      description
      karkunIds
      coordinatorKarkunId
      members {
        _id
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
        }
      }
      coordinator {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;

const CREATE_TEAM: TypedDocumentNode<
  CreateTeamMutation,
  CreateTeamMutationVariables
> = gql`
  mutation createTeam($name: String!, $color: String, $description: String) {
    createTeam(name: $name, color: $color, description: $description) {
      _id
      name
    }
  }
`;

const UPDATE_TEAM: TypedDocumentNode<
  UpdateTeamMutation,
  UpdateTeamMutationVariables
> = gql`
  mutation updateTeam(
    $id: String!
    $name: String!
    $color: String
    $description: String
  ) {
    updateTeam(id: $id, name: $name, color: $color, description: $description) {
      _id
      name
    }
  }
`;

const REMOVE_TEAM: TypedDocumentNode<
  RemoveTeamMutation,
  RemoveTeamMutationVariables
> = gql`
  mutation removeTeam($_id: String!) {
    removeTeam(_id: $_id)
  }
`;

const ADD_TEAM_MEMBER: TypedDocumentNode<
  AddTeamMemberMutation,
  AddTeamMemberMutationVariables
> = gql`
  mutation addTeamMember($teamId: String!, $karkunId: String!) {
    addTeamMember(teamId: $teamId, karkunId: $karkunId) {
      _id
    }
  }
`;

type TeamRow = NonNullable<
  NonNullable<ListAllTeamsQuery['allTeams']>[number]
> & { _id: string; name: string };

const List = () => {
  useBreadcrumbs(['HR', 'Teams']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<TeamFormValues>();
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm] = Form.useForm<TeamFormValues>();

  const { data, loading, refetch } = useQuery(LIST_ALL_TEAMS);
  const allTeams = (data?.allTeams ?? []).filter(
    (row): row is TeamRow => row != null && row._id != null && row.name != null
  );

  const [createTeam, { loading: creating }] = useMutation(CREATE_TEAM, {
    refetchQueries: ['listAllTeams'],
  });
  const [updateTeam, { loading: updating }] = useMutation(UPDATE_TEAM, {
    refetchQueries: ['listAllTeams'],
  });
  const [removeTeam] = useMutation(REMOVE_TEAM, {
    refetchQueries: ['listAllTeams'],
  });
  const [addTeamMember] = useMutation(ADD_TEAM_MEMBER, {
    refetchQueries: ['listAllTeams'],
  });
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);

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

  const handleCreateTeam = () =>
    newForm
      .validateFields()
      .then(values =>
        createTeam({
          variables: {
            name: values.name,
            color: values.color,
            description: values.description,
          },
        })
      )
      .then(() => {
        message.success('Team created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleEditClicked = (record: TeamRow) => {
    editForm.setFieldsValue({
      name: record.name,
      color: record.color ?? undefined,
      description: record.description ?? undefined,
    });
    setEditingTeamId(record._id);
  };

  const handleCloseEditForm = () => {
    setEditingTeamId(null);
    editForm.resetFields();
  };

  const handleUpdateTeam = () =>
    editForm
      .validateFields()
      .then(values =>
        updateTeam({
          variables: {
            id: editingTeamId as string,
            name: values.name,
            color: values.color,
            description: values.description,
          },
        })
      )
      .then(() => {
        message.success('Team updated', 2);
        handleCloseEditForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleAddMemberClicked = (record: TeamRow) => {
    setAddMemberTeamId(record._id);
  };

  const handleCloseAddMemberDrawer = () => {
    setAddMemberTeamId(null);
  };

  const handleSelectKarkunForTeam = (karkun: { _id?: string | null }) => {
    const teamId = addMemberTeamId;
    const karkunId = karkun._id;
    handleCloseAddMemberDrawer();
    if (!teamId || !karkunId) return;

    addTeamMember({ variables: { teamId, karkunId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleDeleteClicked = (record: TeamRow) => {
    removeTeam({
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

  const getTeamMembers = (record: TeamRow): TeamMember[] =>
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

  const totalResults = allTeams.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allTeams.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TeamRow) => (
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
      title: 'Coordinator',
      key: 'coordinator',
      render: (_text: unknown, record: TeamRow) =>
        record.coordinator?.sharedData?.name ?? '',
    },
    {
      title: 'Members',
      key: 'members',
      width: 100,
      render: (_text: unknown, record: TeamRow) =>
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
      render: (_text: unknown, record: TeamRow) => (
        <div className="list-actions-column">
          <Tooltip title="Add Member">
            <UserAddOutlined
              className="list-actions-icon"
              onClick={() => handleAddMemberClicked(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this team?"
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
          New Team
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
            expandedRowRender: (record: TeamRow) => (
              <TeamMembersPanel
                teamId={record._id}
                members={getTeamMembers(record)}
                coordinatorKarkunId={record.coordinatorKarkunId}
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
        title="New Team"
        open={showNewFormModal}
        width={720}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateTeam}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <TeamForm form={newForm} />
      </Modal>

      <Modal
        title="Edit Team"
        open={editingTeamId != null}
        width={720}
        okText="Save"
        confirmLoading={updating}
        onOk={handleUpdateTeam}
        onCancel={handleCloseEditForm}
        destroyOnHidden
      >
        <TeamForm form={editForm} />
      </Modal>

      <Drawer
        title="Select a Karkun"
        width={800}
        onClose={handleCloseAddMemberDrawer}
        open={addMemberTeamId != null}
        destroyOnHidden
      >
        <MSKarkunsList handleSelectItem={handleSelectKarkunForTeam} />
      </Drawer>
    </>
  );
};

export default List;
